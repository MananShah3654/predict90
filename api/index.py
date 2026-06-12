"""
Vercel Python serverless entry point.

The whole FastAPI app lives in ../backend/server.py (also used for local dev).
Vercel bundles backend/** via the `includeFiles` setting in vercel.json, and the
rewrite rule in vercel.json sends every /api/* request to this function, so
FastAPI sees the original path (e.g. /api/auth/login) and matches its routes.
"""
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

from server import app  # noqa: E402  (FastAPI ASGI app)

# Vercel's Python runtime serves the module-level `app` ASGI application.
