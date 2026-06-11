import json
import urllib.request

url = "https://ai-startup-validator-production.up.railway.app/api/generate"
body = {
    "idea": "Pitch-agent test after patch",
    "providers": {
        "product": "groq",
        "market": "groq",
        "finance": "groq",
        "marketing": "groq",
        "pitch": "groq"
    }
}
req = urllib.request.Request(url, data=json.dumps(body).encode("utf-8"), headers={"Content-Type": "application/json"})
with urllib.request.urlopen(req) as resp:
    print(resp.status)
    print(resp.read().decode())
