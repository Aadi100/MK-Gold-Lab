
# MK Gold Lab Verification System (PHP/MySQL)

A high-performance, luxury-branded verification and product management system optimized for **Hostinger** deployment (No Node.js/npm required).

## Setup Instructions

### 1. Upload Files
Upload all contents of this project into your Hostinger `public_html` folder or your local `htdocs` folder (for XAMPP/WAMP).

### 2. Configure Database
Open [config.php](config.php) and update the credentials to match your MySQL database:
```php
$host = 'localhost';
$db   = 'your_database_name';
$user = 'your_username';
$pass = 'your_password';
```

Tables and a master admin account are **automatically created** on the first run; you don't need to execute any scripts.

### 3. Admin Access
- **Default Username**: `admin`
- **Default Password**: `admin`
*(It is highly recommended to create a new user and delete this default one after your first login).*

## Features
- **Silver Bar Records**: Authenticate bars with unique serial numbers.
- **Product Catalog**: Manage products with local file uploads of images.
- **Admin Dashboard**: Secure, session-based dashboard for managing all records and staff accounts.
- **SRK Branding**: Luxury dark and gold theme with constant background imagery and custom formatting.
- **Certificate Generation**: Built-in Canvas-based system for downloading high-quality verification certificates.

## Technical Details
- **Backend**: Native PHP with PDO (MySQL).
- **Frontend**: Vanilla JavaScript (ES6+), Tailwind CSS (via CDN).
- **Storage**: Local `uploads/` folder for product images.
- **No Dependencies**: No `npm`, `composer`, or `server.js` required for production.
