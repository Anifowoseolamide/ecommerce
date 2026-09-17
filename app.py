"""
Root WSGI entrypoint alias for hosting platforms (Render, Railway, Heroku)
that default to `gunicorn app:app` or `gunicorn app:application`.
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from Ecommerce.wsgi import application

# Expose both `app` and `application`
app = application
