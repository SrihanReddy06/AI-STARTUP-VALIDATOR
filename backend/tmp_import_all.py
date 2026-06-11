import sys, traceback
sys.path.insert(0, r'c:\Users\srihan\OneDrive\Pictures\Desktop\multi agent startup builder\backend')
modules = [
    'app.agents.product',
    'app.agents.market',
    'app.agents.finance',
    'app.agents.marketing',
    'app.agents.pitch'
]
for m in modules:
    try:
        __import__(m)
        print(f'Imported {m} OK')
    except Exception:
        print(f'Failed importing {m}')
        traceback.print_exc()
