# BudgetWise - Backend (Server)

This is the backend API for BudgetWise, a modern full-stack expense tracker application. It is built with Node.js and Express.js and provides a secure RESTful API for all frontend operations.

## ✨ Features

- **Secure Authentication:** JWT-based authentication for user registration and login, with password hashing using bcrypt.
- **Protected Routes:** Middleware to protect sensitive endpoints and ensure users can only access their own data.
- **Full CRUD API:** Complete Create, Read, Update, and Delete functionality for user expenses.
- **Scalable Architecture:** Organized with a modular structure (routes, middleware) for easy maintenance and future expansion.
- **Database Integration:** Connects to a PostgreSQL database for reliable and persistent data storage.

## 🛠️ Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL
- **Authentication:** JSON Web Tokens (JWT), bcryptjs
- **Language:** JavaScript (ES Modules)

## 🚀 Getting Started

To run this project locally:

1. Clone the repository.
2. Install dependencies:

    ```bash
    npm install
    ```

3. Set up your PostgreSQL database and create the `users` and `expenses` tables using the `database.sql` script.
4. Create a `.env` file in the root directory and add your database credentials and a JWT secret:

    ```env
    DB_USER=your_username
    DB_HOST=localhost
    DB_NAME=your_database_name
    DB_PASSWORD=your_password
    DB_PORT=5432
    JWT_SECRET=your_super_secret_key
    ```

5. Start the server:

    ```bash
    node index.js
    ```
