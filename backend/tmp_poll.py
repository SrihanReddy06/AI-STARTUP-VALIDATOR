import time, json, urllib.request
plan_id = 8
url = f"https://ai-startup-validator-production.up.railway.app/api/history/{plan_id}"
for i in range(40):
    try:
        with urllib.request.urlopen(url) as r:
            body = r.read().decode()
            j = json.loads(body)
            print(f"Poll #{i+1} Status: {j['status']}")
            if j['status'] != 'processing':
                print(json.dumps(j, indent=2))
                break
    except Exception as e:
        print('Error:', e)
    time.sleep(3)
