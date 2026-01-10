# Alpaca Esclusivi - Backend

This directory contains the Clean Architecture implementation for the Alpaca Esclusivi Backend.

## Architecture

The project follows strict separation of concerns:

1.  **Domain**: Core entities (`Alpaca`) and logic. Independent of frameworks.
2.  **Application (Use Cases)**: Business rules (`BidOnAlpaca`). Orchestrates data flow.
3.  **Infrastructure**: External concerns (`PostgresRepository`, `ExpressWebServer`).
4.  **Presentation**: Entry points (`Controllers`).

## Setup

1.  **Install Dependencies**:
    ```bash
    npm install express pg prisma typeorm zod tsyringe
    ```

2.  **Environment Variables**:
    Create a `.env` file:
    ```env
    DATABASE_URL="postgresql://user:password@localhost:5432/alpaca_db"
    PAYPAL_CLIENT_ID="sb-..."
    PORT=3000
    ```

3.  **Run Database Migrations**:
    ```bash
    npx prisma migrate dev
    ```

4.  **Start Server**:
    ```bash
    npm run start
    ```

## Testing

Run the TDD suite:
```bash
npm test
```
