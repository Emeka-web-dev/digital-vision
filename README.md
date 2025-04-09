# Digital Vision Application

## Description
A NestJS-based application with PostgreSQL for authentication and user management.

## Prerequisites
- Docker and Docker Compose
- Node.js (v16 or higher) and npm
- PostgreSQL client (optional)

## Setup Instructions
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd digital-vision

2. Create an `.env` file in the root directory:
  ```bash
  cp .env.example .env
  ```

3. Start the database:
  ```bash
  docker-compose up -d database
  ```

4. Install dependencies:
  ```bash
  npm install
  ```

5. Run database migrations:
  ```bash
  npm run migration:run
  ```

6. Start the application:
  ```bash
  npm run start
  ```

7. Access the application at `http://localhost:3000`.

## Testing the Endpoints

### Using Postman
1. Import the provided `postman_collection.json` file into Postman.
2. Update the environment variables in Postman to match the values in your `.env` file.

### Using GraphQL Playground
1. Use the provided `schema.graphql` file to test the GraphQL endpoints.
2. Access the GraphQL Playground at `http://localhost:3000/graphql` after starting the application.

## Environment Variables

The application requires the following environment variables, as demonstrated in the `.env.example` file:

| Variable            | Description                     | Example Value                          |
|---------------------|---------------------------------|----------------------------------------|
| `JWT_ACCESS_SECRET` | Secret key for access tokens    | `nestjsPrismaAccessSecret`             |
| `JWT_REFRESH_SECRET`| Secret key for refresh tokens   | `nestjsPrismaRefreshSecret`            |
| `POSTGRES_USER`     | PostgreSQL username            | `user`                                 |
| `POSTGRES_PASSWORD` | PostgreSQL password            | `password`                             |
| `POSTGRES_DB`       | PostgreSQL database name       | `auth_api`                             |
| `POSTGRES_HOST`     | PostgreSQL host                | `localhost`                            |
| `POSTGRES_PORT`     | PostgreSQL port                | `5433`                                 |
| `DATABASE_URL`      | Full database connection URL   | `postgresql://user:password@localhost:5433/auth_api` |

### Example `.env` File
```bash
JWT_ACCESS_SECRET=nestjsPrismaAccessSecret
JWT_REFRESH_SECRET=nestjsPrismaRefreshSecret

POSTGRES_USER=user
POSTGRES_PASSWORD=password
POSTGRES_DB=auth_api
POSTGRES_HOST=localhost
POSTGRES_PORT=5433
DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}"
```

Update the `.env` file with your desired values if needed.