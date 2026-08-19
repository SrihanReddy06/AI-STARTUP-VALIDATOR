import os
import sys
import traceback

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

try:
    import importlib
    importlib.invalidate_caches()
    import app.agents.pitch as p
    print('imported pitch OK')
except Exception:
    traceback.print_exc()
