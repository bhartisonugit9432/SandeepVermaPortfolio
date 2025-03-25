from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
from mysql.connector import Error
from datetime import datetime
import re

app = Flask(__name__)
# Configure CORS to allow requests from your frontend
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:8000"],
        "methods": ["POST", "GET", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "expose_headers": ["Content-Type"],
        "supports_credentials": True
    }
})

# Database configuration
DB_CONFIG = {
    'host': 'localhost',
    'port': 3306,  # Standard MySQL port
    'user': 'root',  # Using the new user we created
    'password': 'Sbharti@2305',  # Using the new password we set
    'database': 'contact_form'  # Your database name
}

def validate_email(email):
    pattern = r'^[\w\.-]+@[\w\.-]+\.\w+$'
    return re.match(pattern, email) is not None

def test_connection():
    try:
        # First try connecting without database to check server
        conn = mysql.connector.connect(
            host=DB_CONFIG['host'],
            port=DB_CONFIG['port'],
            user=DB_CONFIG['user'],
            password=DB_CONFIG['password']
        )
        if conn.is_connected():
            print(f"Successfully connected to MySQL server on port {DB_CONFIG['port']}")
            db_info = conn.get_server_info()
            print(f"MySQL Server version: {db_info}")
            conn.close()
            return True
    except Error as e:
        print(f"Error connecting to MySQL: {e}")
        if "Access denied" in str(e):
            print("Please check your MySQL username and password")
        elif "Can't connect" in str(e):
            print(f"Please check if MySQL is running on port {DB_CONFIG['port']}")
        return False
    return False

# Database initialization
def init_db():
    if not test_connection():
        print("Failed to connect to MySQL. Please check if MySQL is running and credentials are correct.")
        return False
        
    conn = None
    cursor = None
    try:
        # Create database if it doesn't exist
        conn = mysql.connector.connect(
            host=DB_CONFIG['host'],
            port=DB_CONFIG['port'],
            user=DB_CONFIG['user'],
            password=DB_CONFIG['password']
        )
        cursor = conn.cursor()
        
        # Create database with proper character set
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {DB_CONFIG['database']} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
        cursor.fetchall()  # Fetch any unread results
        print(f"Database '{DB_CONFIG['database']}' created or already exists")
        cursor.close()
        conn.close()
        
        # Connect to the database and create table
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor()
        
        # Create contact_submissions table with proper character set
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS contact_submissions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) NOT NULL,
                subject VARCHAR(200) NOT NULL,
                message TEXT NOT NULL,
                submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ''')
        cursor.fetchall()  # Fetch any unread results
        conn.commit()
        print("Database and table created successfully")
        
        # Test if we can select from the table
        cursor.execute("SELECT 1 FROM contact_submissions LIMIT 1")
        cursor.fetchall()  # Fetch the results to avoid "Unread result found" error
        print("Successfully connected to contact_submissions table")
        return True
        
    except Error as e:
        print(f"Error initializing database: {e}")
        if "Access denied" in str(e):
            print("Please check your MySQL user privileges")
        return False
    finally:
        if cursor:
            try:
                cursor.close()
            except Error:
                pass
        if conn and conn.is_connected():
            try:
                conn.close()
            except Error:
                pass

# Initialize database on startup
if not init_db():
    print("Warning: Database initialization failed. The application may not work correctly.")
    print("Please ensure MySQL is running on port 3306 and check your credentials")

@app.route('/api/contact', methods=['GET', 'POST', 'OPTIONS'])
def submit_contact_form():
    if request.method == 'OPTIONS':
        return '', 204
    
    if request.method == 'GET':
        try:
            # Connect to database
            conn = mysql.connector.connect(**DB_CONFIG)
            cursor = conn.cursor(dictionary=True)
            
            # Get all submissions
            cursor.execute('''
                SELECT id, name, email, subject, message, 
                       DATE_FORMAT(submission_date, '%Y-%m-%d %H:%i:%s') as submission_date 
                FROM contact_submissions 
                ORDER BY submission_date DESC
            ''')
            submissions = cursor.fetchall()
            
            return jsonify({
                'message': 'Submissions retrieved successfully',
                'data': submissions
            }), 200
            
        except Error as e:
            print(f"Database error: {e}")
            return jsonify({'error': 'Database error occurred'}), 500
        finally:
            if 'cursor' in locals():
                cursor.close()
            if 'conn' in locals() and conn.is_connected():
                conn.close()
    
    # Handle POST request
    try:
        data = request.json
        name = data.get('name', '').strip()
        email = data.get('email', '').strip()
        subject = data.get('subject', '').strip()
        message = data.get('message', '').strip()

        # Validate required fields
        if not all([name, email, subject, message]):
            return jsonify({'error': 'All fields are required'}), 400

        # Validate email format
        if not validate_email(email):
            return jsonify({'error': 'Invalid email format'}), 400

        # Validate field lengths
        if len(name) > 100:
            return jsonify({'error': 'Name is too long (max 100 characters)'}), 400
        if len(email) > 100:
            return jsonify({'error': 'Email is too long (max 100 characters)'}), 400
        if len(subject) > 200:
            return jsonify({'error': 'Subject is too long (max 200 characters)'}), 400

        try:
            # Store in database
            conn = mysql.connector.connect(**DB_CONFIG)
            cursor = conn.cursor()
            
            insert_query = '''
                INSERT INTO contact_submissions (name, email, subject, message)
                VALUES (%s, %s, %s, %s)
            '''
            cursor.execute(insert_query, (name, email, subject, message))
            conn.commit()

            return jsonify({
                'message': 'Form submitted successfully',
                'data': {
                    'name': name,
                    'email': email,
                    'subject': subject
                }
            }), 200

        except Error as e:
            print(f"Database error: {e}")
            return jsonify({'error': 'Database error occurred'}), 500
        finally:
            if 'cursor' in locals():
                cursor.close()
            if 'conn' in locals() and conn.is_connected():
                conn.close()

    except Exception as e:
        print(f"General error: {e}")
        return jsonify({'error': 'An unexpected error occurred'}), 500

@app.route('/api/contact/<int:submission_id>', methods=['DELETE'])
def delete_submission(submission_id):
    try:
        # Connect to database
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor()
        
        # Check if submission exists
        cursor.execute('SELECT id FROM contact_submissions WHERE id = %s', (submission_id,))
        result = cursor.fetchone()
        
        if not result:
            return jsonify({'error': 'Submission not found'}), 404
        
        # Delete the submission
        cursor.execute('DELETE FROM contact_submissions WHERE id = %s', (submission_id,))
        conn.commit()
        
        return jsonify({
            'message': 'Submission deleted successfully',
            'id': submission_id
        }), 200
        
    except Error as e:
        print(f"Database error: {e}")
        return jsonify({'error': 'Database error occurred'}), 500
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals() and conn.is_connected():
            conn.close()

# Add a root route for testing
@app.route('/')
def home():
    return jsonify({
        'message': 'Server is running',
        'endpoints': {
            '/api/contact': {
                'methods': ['GET', 'POST', 'OPTIONS'],
                'description': 'Submit contact form or get submissions'
            }
        }
    })

if __name__ == '__main__':
    print("Server starting on http://localhost:5000")
    app.run(host='0.0.0.0', port=5000, debug=True) 