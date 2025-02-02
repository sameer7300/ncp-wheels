# Create necessary directories
$dirs = @(
    "apps/accounts/templates/accounts",
    "apps/cars/templates/cars",
    "apps/payments/templates/payments",
    "config/settings",
    "docs/api",
    "docs/deployment",
    "docs/development",
    "static/css",
    "static/js",
    "static/images",
    "static/fonts",
    "templates/includes",
    "templates/errors",
    "tests/accounts",
    "tests/cars",
    "tests/payments",
    "theme/components",
    "theme/styles"
)

foreach ($dir in $dirs) {
    New-Item -Path $dir -ItemType Directory -Force
}

# Move files to their correct locations
# Templates
Move-Item -Path "templates/base.html" -Destination "templates/" -Force
Move-Item -Path "templates/home.html" -Destination "templates/" -Force

# Apps
Move-Item -Path "apps/accounts/templates/*" -Destination "apps/accounts/templates/accounts/" -Force
Move-Item -Path "apps/cars/templates/*" -Destination "apps/cars/templates/cars/" -Force
Move-Item -Path "apps/payments/templates/*" -Destination "apps/payments/templates/payments/" -Force

# Static files
Move-Item -Path "static/css/*" -Destination "static/css/" -Force
Move-Item -Path "static/js/*" -Destination "static/js/" -Force
Move-Item -Path "static/images/*" -Destination "static/images/" -Force
Move-Item -Path "static/fonts/*" -Destination "static/fonts/" -Force

# Configuration
Move-Item -Path "ncp_wheels_v2/settings.py" -Destination "config/settings/base.py" -Force
Copy-Item -Path "config/settings/base.py" -Destination "config/settings/local.py" -Force
Copy-Item -Path "config/settings/base.py" -Destination "config/settings/production.py" -Force

# Clean up
Remove-Item -Path "frontend" -Recurse -Force
Remove-Item -Path "node_modules" -Recurse -Force
