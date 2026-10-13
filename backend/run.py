"""
Run script for HomeEase Junagadh Backend API
"""

import uvicorn
import os
import sys

if __name__ == "__main__":
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    if backend_dir not in sys.path:
        sys.path.insert(0, backend_dir)
    port = int(os.getenv("PORT", 8000))
    print(f"Starting HomeEase Junagadh Backend API on http://127.0.0.1:{port}...")
    uvicorn.run("main:app", host="127.0.0.1", port=port, app_dir=backend_dir, reload=True)
