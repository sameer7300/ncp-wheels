"""
WSGI config for NCP Wheels V2 project.
"""

import os
from django.conf import settings

# Set up Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings_prod')

# Force ALLOWED_HOSTS before application loads
settings.ALLOWED_HOSTS = [
    'ncp-wheels.onrender.com',
    '.onrender.com',
    'ncp-wheels.com',
    'www.ncp-wheels.com',
    'localhost',
    '127.0.0.1',
]

# Print debug information
print("WSGI ALLOWED_HOSTS:", settings.ALLOWED_HOSTS)

from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
