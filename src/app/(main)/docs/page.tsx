import React from 'react';

import {
  Heading,
  Text,
  Section,
  Code,
  Card,
  Link,
  Strong,
  Box,
} from '@radix-ui/themes';

export default function DocsPage() {
  return (
    <Box p="4">
      {' '}
      {/* Using Box for overall padding instead of Section's p prop directly */}
      <Section size="3">
        {' '}
        {/* Section for consistent content sizing */}
        <Heading size="8" mb="6" align="center">
          Developer Documentation
        </Heading>
        <Card mb="5">
          <Heading size="6" mb="3">
            1. Project Overview
          </Heading>
          <Text as="p" mb="2">
            Animotion is a web application designed for creating, customizing,
            and sharing CSS animations. Users can visually build animations,
            save their configurations, and share them with others.
          </Text>
          <Text as="p" mb="2">
            <Strong>Core Technologies:</Strong>
          </Text>
          <ul>
            <li>
              <Text>Next.js (App Router)</Text>
            </li>
            <li>
              <Text>React</Text>
            </li>
            <li>
              <Text>TypeScript</Text>
            </li>
            <li>
              <Text>Supabase (Authentication, Database)</Text>
            </li>
            <li>
              <Text>Radix UI Themes (UI Components)</Text>
            </li>
            <li>
              <Text>SCSS Modules (Styling)</Text>
            </li>
            <li>
              <Text>Drizzle ORM (Database Interaction)</Text>
            </li>
            <li>
              <Text>Vitest & React Testing Library (Testing)</Text>
            </li>
          </ul>
        </Card>
        <Card mb="5">
          <Heading size="6" mb="3">
            2. Getting Started
          </Heading>
          <Box mb="4">
            <Heading size="4" mb="2">
              Local Development Setup
            </Heading>
            <Text as="p" mb="2">
              1. Clone the repository from GitHub.
            </Text>
            <Text as="p" mb="2">
              2. Create a <Code>.env.local</Code> file in the project root. This
              file is crucial for connecting to your Supabase instance. Add the
              following environment variables:
            </Text>
            <Box
              p="3"
              my="2"
              style={{
                backgroundColor: 'var(--gray-a2)',
                borderRadius: 'var(--radius-3)',
                overflowX: 'auto',
              }}
            >
              <Code>
                NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
                <br />
                NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
              </Code>
            </Box>
            <Text as="p" mt="2" mb="2">
              Replace <Code>your_supabase_project_url</Code> and{' '}
              <Code>your_supabase_anon_key</Code> with your actual Supabase
              project credentials.
            </Text>
            <Text as="p" mb="2">
              3. Install dependencies: <Code>yarn install</Code> (or{' '}
              <Code>npm install</Code> if you prefer npm).
            </Text>
            <Text as="p" mb="2">
              4. Run the development server: <Code>yarn dev</Code>. The
              application should now be accessible at{' '}
              <Link
                href="http://localhost:3000"
                target="_blank"
                rel="noopener noreferrer"
              >
                http://localhost:3000
              </Link>
              .
            </Text>
            <Text as="p" mb="2">
              5. To run all checks (type checking, linting, prettier, tests):{' '}
              <Code>yarn checks</Code>.
            </Text>
            <Text as="p">
              6. To automatically fix linting and prettier issues:{' '}
              <Code>yarn checks:fix</Code>.
            </Text>
          </Box>
        </Card>
        <Card mb="5">
          <Heading size="6" mb="3">
            3. Project Structure
          </Heading>
          <Text as="p" mb="2">
            A high-level overview of the key directories within the{' '}
            <Code>src/</Code> folder:
          </Text>
          <ul>
            <li>
              <Text>
                <Strong>src/app/(main)/</Strong>: Contains pages for the main
                application experience, such as the playground (
                <Code>playground/</Code>), user profile (<Code>profile/</Code>),
                and this documentation page (<Code>docs/</Code>). These pages
                typically use the main application layout.
              </Text>
            </li>
            <li>
              <Text>
                <Strong>src/app/(auth)/</Strong>: Houses authentication-related
                pages like login, signup, and password reset flows.
              </Text>
            </li>
            <li>
              <Text>
                <Strong>src/app/api/</Strong>: Backend API routes implemented
                using Next.js API handlers. Key endpoints include those under{' '}
                <Code>configs/</Code> for managing animation configurations and{' '}
                <Code>auth/</Code> for Supabase authentication callbacks.
              </Text>
            </li>
            <li>
              <Text>
                <Strong>src/components/</Strong>: Shared, reusable UI components
                used across various parts of the application (e.g.,{' '}
                <Code>Header.tsx</Code>, <Code>Footer.tsx</Code>,{' '}
                <Code>ConfigCard.tsx</Code>).
              </Text>
            </li>
            <li>
              <Text>
                <Strong>src/hooks/</Strong>: Custom React hooks. Notable
                examples include <Code>useAnimationConfig.ts</Code> for managing
                playground state and <Code>useShareExport.ts</Code> for handling
                sharing/exporting logic.
              </Text>
            </li>
            <li>
              <Text>
                <Strong>src/db/</Strong>: Contains database schema definitions
                (using Drizzle ORM), query functions, and the Supabase client
                setup for database interactions.
              </Text>
            </li>
            <li>
              <Text>
                <Strong>src/context/</Strong>: Global React context providers,
                such as <Code>AuthProvider.tsx</Code> for managing user
                authentication state and <Code>ToastContext.tsx</Code> for
                displaying notifications.
              </Text>
            </li>
            <li>
              <Text>
                <Strong>src/types/</Strong>: TypeScript type definitions and
                interfaces used throughout the project (e.g.,{' '}
                <Code>AnimationConfig</Code>).
              </Text>
            </li>
          </ul>
          <Text as="p" mt="3" mb="2">
            Other important directories:
          </Text>
          <ul>
            <li>
              <Text>
                <Strong>public/</Strong>: For static assets like images (e.g.,{' '}
                <Code>logo.png</Code>) and fonts that are served directly by the
                browser.
              </Text>
            </li>
            <li>
              <Text>
                <Strong>supabase/</Strong>: Contains Supabase database migration
                files, managed by the Supabase CLI.
              </Text>
            </li>
          </ul>
        </Card>
        <Card mb="5">
          <Heading size="6" mb="3">
            4. State Management (Playground Focus)
          </Heading>
          <Text as="p" mb="2">
            The primary state management for the animation configurations within
            the playground is handled by the custom hook{' '}
            <Code>useAnimationConfig</Code> located at{' '}
            <Code>src/app/(main)/playground/hooks/useAnimationConfig.ts</Code>.
          </Text>
          <Text as="p" mb="2">
            This hook is responsible for:
          </Text>
          <ul>
            <li>
              <Text>
                Fetching an existing animation configuration if an ID is present
                in the URL.
              </Text>
            </li>
            <li>
              <Text>
                Managing the local state of the <Code>AnimationConfig</Code>{' '}
                object as the user modifies parameters in the UI.
              </Text>
            </li>
            <li>
              <Text>
                Saving new configurations or updating existing ones via API
                calls to <Code>/api/configs</Code>. This requires user
                authentication.
              </Text>
            </li>
            <li>
              <Text>
                Handling the &quot;copy&quot; (or &quot;Save As&quot;)
                functionality for configurations.
              </Text>
            </li>
            <li>
              <Text>Resetting the configuration to its default state.</Text>
            </li>
          </ul>
          <Text as="p" mt="2" mb="2">
            The <Code>useAnimationConfig</Code> hook also manages an{' '}
            <Code>isDirty</Code> state. If <Code>isDirty</Code> is true (meaning
            there are unsaved changes to the current configuration), the
            application will prompt the user with a confirmation dialog if they
            attempt to navigate away from the playground or close the browser
            tab. This helps prevent accidental loss of work.
          </Text>
        </Card>
        <Card mb="5">
          <Heading size="6" mb="3">
            5. API Endpoints
          </Heading>
          <Text as="p" mb="2">
            The backend API is built using Next.js API routes. Key endpoints
            include:
          </Text>
          <Box mb="3">
            <Heading size="4" mb="1">
              <Code>/api/configs/</Code>
            </Heading>
            <ul>
              <li>
                <Text>
                  <Strong>GET /api/configs/{'{id}'}</Strong>: Fetches a specific
                  animation configuration by its ID. The backend checks if the
                  configuration is public or if the requesting user is the
                  owner.
                </Text>
              </li>
              <li>
                <Text>
                  <Strong>POST /api/configs</Strong>: Creates a new animation
                  configuration. Requires user authentication. The new
                  configuration is associated with the authenticated user.
                </Text>
              </li>
              <li>
                <Text>
                  <Strong>PUT /api/configs/{'{id}'}</Strong>: Updates an
                  existing animation configuration. Requires user authentication
                  and ownership of the configuration.
                </Text>
              </li>
              <li>
                <Text>
                  <Strong>DELETE /api/configs/{'{id}'}</Strong>: Deletes an
                  animation configuration. Requires user authentication and
                  ownership of the configuration.
                </Text>
              </li>
            </ul>
          </Box>
          <Box>
            <Heading size="4" mb="1">
              <Code>/api/auth/</Code>
            </Heading>
            <Text as="p">
              This route (and its sub-routes like{' '}
              <Code>/api/auth/callback</Code>, <Code>/api/auth/signout</Code>)
              are primarily handled by the Supabase Auth Helpers for Next.js to
              manage authentication flows such as sign-in, sign-up, and sign-out
              callbacks.
            </Text>
          </Box>
        </Card>
        <Card mb="5">
          <Heading size="6" mb="3">
            6. Styling
          </Heading>
          <Text as="p" mb="2">
            Styling in Animotion is achieved through a combination of:
          </Text>
          <ul>
            <li>
              <Text>
                <Strong>SCSS Modules:</Strong> Most components have their own{' '}
                <Code>.module.scss</Code> file (e.g.,{' '}
                <Code>Playground.module.scss</Code>,{' '}
                <Code>ConfigCard.module.scss</Code>). This approach scopes
                styles locally to the component, preventing global style
                conflicts.
              </Text>
            </li>
            <li>
              <Text>
                <Strong>Global Stylesheet:</Strong> A global stylesheet is
                located at <Code>src/app/globals.scss</Code>. This file includes
                base styling, CSS variable definitions, and utility classes that
                apply across the entire application.
              </Text>
            </li>
            <li>
              <Text>
                <Strong>Radix UI Themes:</Strong> The application uses{' '}
                <Link
                  href="https://www.radix-ui.com/themes"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Radix UI Themes
                </Link>{' '}
                for its base set of UI components (<Code>Button</Code>,{' '}
                <Code>Card</Code>, <Code>Select</Code>, etc.) and for its
                theming capabilities (including dark mode). Customizations and
                overrides are applied where necessary via SCSS.
              </Text>
            </li>
          </ul>
        </Card>
        <Card>
          <Heading size="6" mb="3">
            7. Testing
          </Heading>
          <Text as="p" mb="2">
            Tests are located in the <Code>src/tests/</Code> directory. The
            testing framework used is Vitest, along with React Testing Library
            for component and hook testing.
          </Text>
          <Text as="p" mb="2">
            To run all tests, use the command: <Code>yarn test</Code> (this
            executes <Code>vitest run</Code> as defined in{' '}
            <Code>package.json</Code>).
          </Text>
          <Text as="p" mb="2">
            {' '}
            {/* Changed from just <Text> to <Text as="p"> for consistency */}
            The current test suite includes:
          </Text>
          <ul>
            <li>
              <Text>
                Unit tests for custom hooks (e.g.,{' '}
                <Code>useAnimationConfig.test.ts</Code>).
              </Text>
            </li>
            <li>
              <Text>
                Component tests for UI components (e.g.,{' '}
                <Code>ConfigPanel.test.tsx</Code>).
              </Text>
            </li>
          </ul>
          <Text as="p" mt="2">
            For more detailed test execution options (e.g., watch mode,
            coverage), refer to the scripts in <Code>package.json</Code> or the
            Vitest documentation.
          </Text>
        </Card>
      </Section>
    </Box>
  );
}
