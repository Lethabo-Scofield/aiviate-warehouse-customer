# Warehouse Ecommerce Backend

This folder contains the API and PostgreSQL database layer for the website.

## Setup

1. Install dependencies:
   npm install
2. Create env file:
   copy .env.example .env
3. Set values in .env, especially DATABASE_URL and JWT_SECRET.
4. Start backend:
   npm start

The server auto-creates tables and seeds starter categories/products on startup.

## Main Endpoints

- GET /health
- POST /auth/register
- POST /auth/login
- GET /auth/me
- GET /api/categories
- GET /api/products
- GET /api/products/:id
- GET /orders (auth)
- POST /orders (auth)
- GET /orders/:id (auth)
- PUT /orders/:id/status (auth)
