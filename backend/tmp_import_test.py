import sys
import traceback

# Ensure backend package is on sys.path
sys.path.insert(0, r'c:\Users\srihan\OneDrive\Pictures\Desktop\multi agent startup builder\backend')

try:
    import importlib
    importlib.invalidate_caches()
    import app.agents.pitch as p
    print('imported pitch OK')
except Exception:
    traceback.print_exc()
