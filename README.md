# Animation Playground

Welcome to the Animation Playground! This Next.js application provides a user-friendly interface for creating, previewing, and sharing web animations. It leverages the `animation-library-test-abdullah-altun` library to power its animation capabilities and offers a seamless experience for both novice and experienced developers.

## Features

- **Intuitive Animation Configuration:** Easily create and customize animations (fade, slide, scale, rotate, bounce) through a simple UI.
- **Live Preview:** Instantly see your animations in action as you configure them.
- **Code Generation:** Generate React component code and CSS for your animations.
- **Shareable Configurations:** Save your animation configurations and share them with others via unique URLs.
- **User Accounts:** Sign up and log in to save and manage your animation configurations.
- **Responsive Design:** The playground is designed to work seamlessly across various devices.
- **Built with Modern Technologies:** Utilizes Next.js, React, TypeScript, Supabase (for backend services), and Radix UI (for UI components).

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- Node.js (version 18.x or higher recommended)
- Yarn (or npm/pnpm)
- A Supabase account and project (if you want to use the backend features like saving configurations)

### Installation

1.  **Clone the repository:**

    ```bash
    git clone <repository-url>
    cd animation-playground
    ```

2.  **Install dependencies:**

    ```bash
    yarn install
    # or
    # npm install
    # or
    # pnpm install
    ```

3.  **Set up environment variables:**

    Create a `.env.local` file in the root of your project and add the following environment variables. You can get these from your Supabase project settings.

    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    # Optional: If you are using Supabase authentication with a JWT secret
    # SUPABASE_JWT_SECRET=your_supabase_jwt_secret
    ```

4.  **Run database migrations (if applicable):**

    This project uses Drizzle ORM. If there are database schema changes or you're setting up the database for the first time:

    ```bash
    yarn drizzle-kit generate # To generate migration files (if you made schema changes)
    yarn drizzle-kit migrate  # To apply migrations to your database
    ```

    _Note: Ensure your database connection string is correctly configured for Drizzle, potentially in a `drizzle.config.ts` or similar, and that your Supabase database is ready._

5.  **Run the development server:**

    ```bash
    yarn dev
    ```

    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Available Scripts

In the project directory, you can run:

- `yarn dev`: Runs the app in development mode with Turbopack.
- `yarn build`: Builds the app for production.
- `yarn start`: Starts the production server.
- `yarn lint`: Lints the codebase using Next.js's built-in ESLint configuration.
- `yarn lint:fix`: Lints and automatically fixes issues.
- `yarn typecheck`: Runs TypeScript type checking.
- `yarn prettier`: Checks for Prettier formatting issues.
- `yarn prettier:fix`: Formats files with Prettier.
- `yarn test`: Runs Vitest tests.
- `yarn test:watch`: Runs Vitest tests in watch mode.
- `yarn test:coverage`: Runs Vitest tests and generates a coverage report.
- `yarn checks`: Runs all checks (typecheck, lint, prettier, test).
- `yarn checks:fix`: Runs all checks and attempts to fix issues.

## Project Structure

A brief overview of the key directories:

- `public/`: Static assets.
- `src/`:
  - `app/`: Next.js App Router, including pages, layouts, and API routes.
    - `(auth)/`: Routes and components related to authentication.
    - `(main)/`: Main application routes like the playground, documentation, profile.
  - `components/`: Shared React components used throughout the application.
  - `context/`: React context providers (e.g., ToastContext).
  - `db/`: Drizzle ORM schema, migrations, and database utilities.
  - `hooks/`: Custom React hooks.
  - `test-animations/`: Contains a test page (`page.tsx`) for demonstrating various animations using the `animation-library-test-abdullah-altun`.
  - `tests/`: Vitest unit and integration tests.
    - `components/`: Tests for React components.
    - `hooks/`: Tests for custom React hooks.
  - `types/`: TypeScript type definitions.
- `supabase/`: Supabase specific configurations, typically for local development or migrations if not using Drizzle Kit directly for schema management with Supabase.
- `docs/`: Generated TypeDoc documentation.

## Core Technologies

- **Next.js:** React framework for server-side rendering, static site generation, and more.
- **React:** JavaScript library for building user interfaces.
- **TypeScript:** Superset of JavaScript that adds static typing.
- **`animation-library-test-abdullah-altun`:** The core library providing animation functionalities.
- **Supabase:** Open-source Firebase alternative for backend services (database, auth).
- **Drizzle ORM:** TypeScript ORM for interacting with the SQL database.
- **Radix UI:** Unstyled, accessible UI components.
- **Vitest:** Fast and modern testing framework.
- **ESLint & Prettier:** For code linting and formatting.

## Testing

This project uses Vitest for unit and integration testing.

- Run all tests: `yarn test`
- Run tests in watch mode: `yarn test:watch`
- Generate a coverage report: `yarn test:coverage`

Test files are primarily located in the `src/tests/` directory, mirroring the structure of the code they are testing.

## Documentation

📚 **Comprehensive documentation is available at:** [docs.page/abdullahaltun70/animation-playground](https://docs.page/abdullahaltun70/animation-playground)

The documentation includes:

- **Getting Started Guide** - Setup and installation instructions
- **User Guide** - How to create, configure, and share animations
- **Developer Documentation** - Project structure, testing, and contributing
- **API Reference** - Complete TypeDoc-generated API documentation

### Alternative Documentation Access

If the docs.page link is not accessible, you can also:

1. **Generate TypeDoc locally**: Run `yarn typedoc` to create API documentation in the `docs/` directory
2. **Browse documentation files**: View the comprehensive guides in the `/docs` folder of this repository
3. **Access during development**: API docs are available at `/docs` when running the dev server

> **Note:** The docs.page site may take a few minutes to sync after repository changes are pushed to GitHub.

## Contributing

Contributions are welcome! If you have suggestions or want to contribute to the project, please feel free to open an issue or submit a pull request.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## License

This project is licensed under the MIT License - see the `LICENSE` file for details (if one exists, otherwise assume it's proprietary or specify).

---

This README provides a comprehensive overview of the Animation Playground. If you have any questions or need further assistance, please don't hesitate to reach out or check the existing documentation and code.
