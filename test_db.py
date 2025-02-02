import os
import MySQLdb
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Database connection parameters
params = {
    'host': os.getenv('DB_HOST', '185.201.11.154'),
    'port': int(os.getenv('DB_PORT', '3306')),
    'user': os.getenv('DB_USER', 'u466615417_sameergul321'),
    'password': os.getenv('DB_PASSWORD'),
    'db': os.getenv('DB_NAME', 'u466615417_ncpwheels'),
    'charset': 'utf8mb4',
    'connect_timeout': 60,
}

print("Attempting to connect with parameters:")
for key, value in params.items():
    if key != 'password':
        print(f"{key}: {value}")

try:
    connection = MySQLdb.connect(**params)
    print("Successfully connected to the database!")
    cursor = connection.cursor()
    cursor.execute("SELECT VERSION()")
    version = cursor.fetchone()
    print(f"MySQL version: {version[0]}")
    connection.close()
except Exception as e:
    print(f"Error connecting to the database: {str(e)}")
