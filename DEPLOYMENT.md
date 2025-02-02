# Deployment Guide for NCP-Wheels

## Pre-deployment Checklist

1. Update `.env.production` with your actual credentials
2. Install required system packages:
   ```bash
   sudo apt-get update
   sudo apt-get install python3-pip python3-dev libmysqlclient-dev default-mysql-server nginx
   ```

3. Create a virtual environment and install requirements:
   ```bash
   python -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

4. Collect static files:
   ```bash
   python manage.py collectstatic --settings=config.settings_prod
   ```

5. Create the database and run migrations:
   ```bash
   python manage.py migrate --settings=config.settings_prod
   ```

## Hostinger Setup

1. Log in to your Hostinger control panel
2. Go to "Websites" > "Manage" > "MySQL Databases"
3. Create a new MySQL database and user
4. Note down the database credentials and update `.env.production`

## Domain and SSL Setup

1. In Hostinger control panel, go to "Domains"
2. Point your domain (ncp-wheels.com) to Hostinger nameservers
3. Enable SSL certificate through Hostinger's SSL section

## Application Deployment

1. Upload your code to Hostinger via FTP or Git
2. Set up a Python application in Hostinger
3. Configure the following in Hostinger's Python app settings:
   - Python version: 3.9+
   - Start Command: `gunicorn config.wsgi:application`
   - Environment variables: Copy from `.env.production`

## Post-deployment

1. Test the website thoroughly at https://ncp-wheels.com
2. Check all forms and user interactions
3. Verify SSL is working correctly
4. Monitor error logs for any issues

## Important Notes

- Keep your `.env.production` file secure and never commit it to version control
- Regularly backup your database
- Monitor your application logs for errors
- Set up monitoring for your application
