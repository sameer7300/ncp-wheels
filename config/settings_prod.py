"""
Production settings for NCP Wheels project.
"""
import os
import sys
from .settings import *

# Add the project root to the Python path
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.insert(0, PROJECT_ROOT)

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = False

# Update allowed hosts - temporarily allow all hosts for debugging
ALLOWED_HOSTS = ['*']

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Third party apps
    'crispy_forms',
    'crispy_bootstrap5',
    'rest_framework',
    'corsheaders',
    'phonenumber_field',
    'django_filters',
    
    # Local apps
    'apps.users',
    'apps.cars',
    'apps.payments',
    'apps.analytics',
    'apps.messaging',
    'apps.notifications',
]

# Remove debug toolbar middleware if present
if 'debug_toolbar.middleware.DebugToolbarMiddleware' in MIDDLEWARE:
    MIDDLEWARE.remove('debug_toolbar.middleware.DebugToolbarMiddleware')

# CORS settings
CORS_ALLOWED_ORIGINS = [
    "https://ncp-wheels.com",
    "https://www.ncp-wheels.com",
    "https://ncp-wheels.onrender.com",
]
CORS_ALLOW_CREDENTIALS = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Media files
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Security settings
CSRF_TRUSTED_ORIGINS = ['https://ncp-wheels.onrender.com', 'https://ncp-wheels.com', 'https://www.ncp-wheels.com']
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_HSTS_SECONDS = 31536000  # 1 year
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

# Crispy Forms
CRISPY_ALLOWED_TEMPLATE_PACKS = "bootstrap5"
CRISPY_TEMPLATE_PACK = "bootstrap5"

# Rest Framework
REST_FRAMEWORK = {
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ],
    'DEFAULT_PARSER_CLASSES': [
        'rest_framework.parsers.JSONParser',
    ],
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
    ],
}

# Add whitenoise middleware at the top
if 'whitenoise.middleware.WhiteNoiseMiddleware' not in MIDDLEWARE:
    MIDDLEWARE.insert(1, 'whitenoise.middleware.WhiteNoiseMiddleware')

# Print debug info
print("Python version:", sys.version)
print("Attempting database connection with following parameters:")
print(f"HOST: {os.getenv('DB_HOST', 'srv1757.hstgr.io')}")
print(f"PORT: {os.getenv('DB_PORT', '3306')}")
print(f"NAME: {os.getenv('DB_NAME', 'u466615417_ncpwheels')}")
print(f"USER: {os.getenv('DB_USER', 'u466615417_sameergul321')}")

# Database settings for Hostinger MySQL
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': os.getenv('DB_NAME', 'u466615417_ncpwheels'),
        'USER': os.getenv('DB_USER', 'u466615417_sameergul321'),
        'PASSWORD': os.getenv('DB_PASSWORD'),
        'HOST': os.getenv('DB_HOST', 'srv1757.hstgr.io'),  # Hostinger MySQL server hostname
        'PORT': os.getenv('DB_PORT', '3306'),
        'OPTIONS': {
            'charset': 'utf8mb4',
            'connect_timeout': 60,
            'autocommit': True,
            'init_command': "SET sql_mode='STRICT_TRANS_TABLES'",
            'ssl': True,  # Enable SSL for secure connection
        }
    }
}

# Logging configuration
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
    },
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': True,
        },
        'django.db.backends': {
            'handlers': ['console'],
            'level': 'ERROR',
            'propagate': False,
        },
        'apps': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': True,
        },
    },
}

# Email settings
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = os.getenv('EMAIL_HOST', 'smtp.hostinger.com')
EMAIL_PORT = int(os.getenv('EMAIL_PORT', 587))
EMAIL_USE_TLS = True
EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD')
DEFAULT_FROM_EMAIL = os.getenv('DEFAULT_FROM_EMAIL')
