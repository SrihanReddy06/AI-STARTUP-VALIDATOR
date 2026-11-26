#!/usr/bin/env python3
"""
Deploy BLOG.md directly to Medium using Medium's official REST API.
Uploads all local images to Medium's CDN and creates a formatted draft/story.
"""

import os
import sys
import re
import mimetypes
import requests
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
load_dotenv(Path(__file__).parent / "backend" / ".env")

MEDIUM_API_BASE = "https://api.medium.com/v1"


def get_token():
    token = os.getenv("MEDIUM_INTEGRATION_TOKEN") or os.getenv("MEDIUM_TOKEN")
    if not token and len(sys.argv) > 1:
        token = sys.argv[1].strip()
    return token


def upload_image_to_medium(image_path: Path, token: str) -> str:
    """Uploads a local image file to Medium and returns the CDN URL."""
    url = f"{MEDIUM_API_BASE}/images"
    headers = {"Authorization": f"Bearer {token}"}
    
    mime_type, _ = mimetypes.guess_type(str(image_path))
    if not mime_type:
        mime_type = "image/png"

    print(f"  Uploading {image_path.name} to Medium CDN...")
    with open(image_path, "rb") as f:
        files = {"image": (image_path.name, f, mime_type)}
        resp = requests.post(url, headers=headers, files=files)
    
    if resp.status_code not in (200, 201):
        raise RuntimeError(f"Failed to upload image {image_path.name}: {resp.status_code} - {resp.text}")
    
    data = resp.json().get("data", {})
    medium_url = data.get("url")
    if not medium_url:
        raise RuntimeError(f"No URL returned for image {image_path.name}: {resp.text}")
    
    return medium_url


def deploy(token: str, publish_status: str = "draft"):
    workspace_dir = Path(__file__).parent
    blog_file = workspace_dir / "BLOG.md"

    if not blog_file.exists():
        raise FileNotFoundError(f"Could not find {blog_file}")

    print("Authenticating with Medium API...")
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        "Accept": "application/json",
    }

    # 1. Fetch current user profile
    me_resp = requests.get(f"{MEDIUM_API_BASE}/me", headers=headers)
    if me_resp.status_code != 200:
        raise RuntimeError(f"Authentication failed ({me_resp.status_code}): {me_resp.text}")

    user_data = me_resp.json().get("data", {})
    user_id = user_data.get("id")
    username = user_data.get("username")
    name = user_data.get("name")
    print(f"Authenticated as: {name} (@{username}) [ID: {user_id}]")

    # 2. Read BLOG.md
    content = blog_file.read_text(encoding="utf-8")

    # 3. Find and upload all local images
    # Matches patterns like ![alt](./blog/images/...) or ![alt](blog/images/...)
    image_pattern = re.compile(r'!\[(.*?)\]\(((\./)?blog/images/([^\)]+))\)')
    matches = list(image_pattern.finditer(content))

    uploaded_cache = {}
    print(f"Found {len(matches)} image references in BLOG.md. Uploading to Medium CDN...")

    for match in matches:
        full_match = match.group(0)
        alt_text = match.group(1)
        rel_path = match.group(2)
        filename = match.group(4)
        
        local_path = workspace_dir / "blog" / "images" / filename
        if local_path.exists():
            if filename not in uploaded_cache:
                cdn_url = upload_image_to_medium(local_path, token)
                uploaded_cache[filename] = cdn_url
            else:
                cdn_url = uploaded_cache[filename]
            
            # Replace local path with Medium CDN URL
            replacement = f"![{alt_text}]({cdn_url})"
            content = content.replace(full_match, replacement)
        else:
            print(f"  Warning: local image file not found: {local_path}")

    # 4. Remove unsupported Mermaid code block for Medium (Medium displays raw text for unsupported blocks)
    # Convert mermaid into an ASCII representation or descriptive quote
    mermaid_block_pattern = re.compile(r'```mermaid[\s\S]*?```')
    mermaid_replacement = (
        "> **Architecture Flow**: *User Input -> Context Engine -> Product Strategist -> "
        "Market Researcher -> Financial Architect (with Critique & Debate Loop) -> "
        "Growth & GTM -> Pitch Architect -> Operations Roadmap -> Executive Boardroom*"
    )
    content = mermaid_block_pattern.sub(mermaid_replacement, content)

    # 5. Extract Title
    title = "Building an Autonomous AI Advisory Board: How We Engineered a Multi-Agent Startup Validator"
    title_match = re.search(r'^#\s+(.+)$', content, re.MULTILINE)
    if title_match:
        title = title_match.group(1).strip()

    # 6. Post article to Medium
    post_payload = {
        "title": title,
        "contentFormat": "markdown",
        "content": content,
        "tags": [
            "Artificial Intelligence",
            "Startups",
            "Machine Learning",
            "Software Development",
            "Python"
        ],
        "publishStatus": publish_status
    }

    print(f"\nCreating story on Medium (publishStatus: {publish_status})...")
    create_resp = requests.post(
        f"{MEDIUM_API_BASE}/users/{user_id}/posts",
        headers=headers,
        json=post_payload
    )

    if create_resp.status_code not in (200, 201):
        raise RuntimeError(f"Failed to create story: {create_resp.status_code} - {create_resp.text}")

    story_data = create_resp.json().get("data", {})
    story_url = story_data.get("url")
    print("\n" + "=" * 60)
    print("SUCCESSFULLY DEPLOYED TO MEDIUM!")
    print(f"Story URL: {story_url}")
    print(f"Status: {publish_status.upper()}")
    print("=" * 60)
    return story_url


if __name__ == "__main__":
    token = get_token()
    if not token:
        print("\n[!] Medium Integration Token not found.")
        print("Usage: python deploy_to_medium.py <YOUR_MEDIUM_INTEGRATION_TOKEN>")
        print("Or set MEDIUM_INTEGRATION_TOKEN in your environment or .env file.")
        print("\nTo get your token:")
        print("1. Go to https://medium.com/me/settings/security")
        print("2. Scroll down to 'Integration tokens'")
        print("3. Generate a token and run this script with it.\n")
        sys.exit(1)

    status = sys.argv[2] if len(sys.argv) > 2 else "draft"
    deploy(token, status)
