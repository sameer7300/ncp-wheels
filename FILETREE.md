# NCP Wheels V2 - Project File Structure

```
ncp_wheels_v2/
├── apps/                      # Application modules
│   ├── accounts/             # User authentication and profiles
│   │   ├── migrations/
│   │   ├── templates/
│   │   │   └── accounts/
│   │   │       ├── login.html
│   │   │       ├── register.html
│   │   │       ├── password_reset.html
│   │   │       └── password_reset_confirm.html
│   │   ├── __init__.py
│   │   ├── admin.py
│   │   ├── apps.py
│   │   ├── forms.py
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── urls.py
│   │   └── views.py
│   ├── cars/                 # Car listings and management
│   │   ├── migrations/
│   │   ├── templates/
│   │   │   └── cars/
│   │   │       ├── car_list.html
│   │   │       ├── car_detail.html
│   │   │       └── car_form.html
│   │   ├── __init__.py
│   │   ├── admin.py
│   │   ├── apps.py
│   │   ├── forms.py
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── urls.py
│   │   └── views.py
│   └── payments/             # Payment processing
│       ├── migrations/
│       ├── templates/
│       │   └── payments/
│       ├── __init__.py
│       ├── admin.py
│       ├── apps.py
│       ├── models.py
│       ├── serializers.py
│       ├── urls.py
│       └── views.py
├── config/                   # Configuration files
│   ├── settings/
│   │   ├── __init__.py
│   │   ├── base.py          # Base settings
│   │   ├── local.py         # Local development settings
│   │   └── production.py    # Production settings
│   └── wsgi.py
├── docs/                     # Documentation
│   ├── api/                  # API documentation
│   ├── deployment/          # Deployment guides
│   └── development/         # Development guides
├── static/                   # Static files
│   ├── css/                 # Compiled CSS
│   ├── js/                  # JavaScript files
│   ├── images/             # Image assets
│   └── fonts/              # Font files
├── templates/               # Global templates
│   ├── base.html           # Base template
│   ├── home.html           # Homepage
│   ├── includes/           # Reusable template parts
│   └── errors/             # Error pages (404, 500)
├── tests/                   # Test files
│   ├── accounts/
│   ├── cars/
│   └── payments/
├── theme/                   # Theme customization
│   ├── components/         # TailwindCSS components
│   └── styles/             # Custom styles
├── .gitignore              # Git ignore file
├── manage.py               # Django management script
├── package.json            # Node.js dependencies
├── requirements.txt        # Python dependencies
├── README.md              # Project documentation
└── tailwind.config.js     # TailwindCSS configuration

## Directory Structure Explanation

### `/apps`
Contains all Django applications, each with its own models, views, templates, and tests.

### `/config`
Project configuration files including Django settings for different environments.

### `/docs`
Project documentation including API specs, deployment guides, and development setup.

### `/static`
Static files like CSS, JavaScript, images, and fonts.

### `/templates`
Global templates and includes that are shared across apps.

### `/tests`
Test files organized by app for better maintainability.

### `/theme`
Theme-related files including TailwindCSS components and custom styles.

## Key Files

- `manage.py`: Django's command-line utility for administrative tasks
- `requirements.txt`: Python package dependencies
- `package.json`: Node.js dependencies for frontend tools
- `tailwind.config.js`: TailwindCSS configuration
- `.gitignore`: Specifies which files Git should ignore

## Development Setup

1. Create and activate virtual environment
2. Install Python dependencies: `pip install -r requirements.txt`
3. Install Node.js dependencies: `npm install`
4. Run migrations: `python manage.py migrate`
5. Start development server: `python manage.py runserver`
