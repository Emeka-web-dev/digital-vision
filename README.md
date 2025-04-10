# NestJS Authentication Service

A robust authentication service built with NestJS, GraphQL, and Prisma, supporting user authentication methods including email/password, JWT tokens, and biometric authentication.

## Features

- 🔑 JWT token-based authentication with refresh mechanism
- 👆 Biometric authentication support
- 🛡️ Secure password and biometric data storage
- 📝 GraphQL API with full type safety
- 🧪 Comprehensive test coverage

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm or yarn
- Docker and Docker Compose
- PostgreSQL database (optional if using Docker Compose)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Emeka-web-dev/digital-vision.git
cd digital-vision
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Update the `.env` file with your database credentials and JWT secrets.

### Setting Up the Database

#### Using Docker Compose
If you want to use Docker Compose to set up the PostgreSQL database:
1. Start the database:
   ```bash
   docker-compose up -d
   ```
2. Verify that the database is running:
   ```bash
   docker ps
   ```

#### Without Docker Compose
If you already have PostgreSQL installed, ensure the database is configured with the credentials specified in your `.env` file.

5. Set up the database schema:
```bash
npx prisma migrate dev
# or
yarn prisma migrate dev
```

6. Start the development server:
```bash
npm run start:dev
# or
yarn start:dev
```

The GraphQL playground will be available at `http://localhost:3000/graphql`.

## Running Tests

```bash
# Unit tests
npm run test
# or
yarn test

# e2e tests
npm run test:e2e
# or
yarn test:e2e

# Test coverage
npm run test:cov
# or
yarn test:cov
```

## API Documentation

For detailed API documentation, see [DOCUMENTATION.md](DOCUMENTATION.md).

## Environment Variables

The following environment variables are required:

- `DATABASE_URL`: PostgreSQL connection string
- `JWT_ACCESS_SECRET`: Secret key for signing access tokens
- `JWT_REFRESH_SECRET`: Secret key for signing refresh tokens
- `PORT`: Server port (defaults to 3000)

Additional optional variables can be found in `.env.example`.

## Project Structure

```
src/
├── auth/                # Authentication module
│   ├── dto/             # Data transfer objects
│   ├── models/          # GraphQL models
│   ├── auth.module.ts   # Module definition
│   ├── auth.resolver.ts # GraphQL resolver
│   ├── auth.service.ts  # Authentication service
│   └── ...
├── users/               # Users module
│   ├── models/          # GraphQL models
│   ├── users.module.ts  # Module definition
│   ├── users.resolver.ts# GraphQL resolver
│   ├── users.service.ts # Users service
│   └── ...
├── common/              # Shared code
├── app.module.ts        # Root module
└── main.ts              # Application entry point
```

## Authentication Flow

1. **Signup**: Create a new user account
2. **Login**: Authenticate with email/password
3. **Set Biometric Data**: Add biometric authentication to account
4. **Biometric Login**: Authenticate with biometric data
5. **Token Refresh**: Get new tokens using a refresh token

## Using Docker Compose for the Database

The project includes a `docker-compose.yml` file to set up a PostgreSQL database. Follow these steps:

1. Ensure Docker and Docker Compose are installed on your system.
2. Start the database:
   ```bash
   docker-compose up -d
   ```
3. Verify the database is running:
   ```bash
   docker ps
   ```
4. The database will be accessible at `localhost:5433` (or the port specified in your `.env` file).

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/my-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.