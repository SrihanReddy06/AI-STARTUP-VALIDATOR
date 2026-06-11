import json, urllib.request
plan_id = 8
url = f"https://ai-startup-validator-production.up.railway.app/api/history/{plan_id}"
with urllib.request.urlopen(url) as r:
    print(r.read().decode())
