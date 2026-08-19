import os, sys, traceback
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)
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
