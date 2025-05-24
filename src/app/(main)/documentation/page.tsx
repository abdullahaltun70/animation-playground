'use client';

import React from 'react';

import { MagnifyingGlassIcon } from '@radix-ui/react-icons'; // You might need to install @radix-ui/react-icons if not already present
// Import TextField and MagnifyingGlassIcon
import {
  Theme,
  Tabs,
  Box,
  Heading,
  Text,
  TextField,
  Flex,
} from '@radix-ui/themes';

function DocumentationPage() {
  return (
    <Theme
      accentColor="indigo"
      grayColor="slate"
      // panelBackground="translucent" // Keeping this consistent with your existing setup
      // scaling="100%"
      // radius="medium"
      // The Theme component should ideally wrap the entire application in your layout.tsx
      // Applying it here again might cause nested themes. For now, I'll keep your structure.
    >
      <Box
        style={{
          // padding: 'var(--space-4)',
          height: '100vh', // Adjust 80px based on your header/footer height
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Flex justify="between" align="center" mb="4">
          <Heading>Documentation</Heading>
          {/* Search Bar Placeholder */}
          <Box style={{ minWidth: '300px', maxWidth: '400px' }}>
            <TextField.Root
              placeholder="Search documentation (Cmd+K)..."
              disabled
            >
              <TextField.Slot>
                <MagnifyingGlassIcon height="16" width="16" />
              </TextField.Slot>
            </TextField.Root>
            <Text as="div" size="1" color="gray" mt="1" align="right">
              (Cmd+K search is a planned feature)
            </Text>
          </Box>
        </Flex>

        <Tabs.Root
          defaultValue="playground-api"
          style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}
        >
          <Tabs.List>
            <Tabs.Trigger value="playground-api">Playground API</Tabs.Trigger>
            <Tabs.Trigger value="animation-library">
              Animation Library
            </Tabs.Trigger>
          </Tabs.List>

          <Box
            pt="4"
            style={{ flexGrow: 1, overflow: 'auto', position: 'relative' }} // Changed overflow to auto
          >
            <Tabs.Content
              value="playground-api"
              style={{ height: '100%', width: '100%', outline: 'none' }}
            >
              <iframe
                src="/docs/index.html" // This is your locally hosted Playground API docs
                title="Playground API Documentation"
                style={{ width: '100vw', height: '100vh', border: 'none' }}
              />
            </Tabs.Content>

            <Tabs.Content value="animation-library">
              Animation library docs
            </Tabs.Content>
          </Box>
        </Tabs.Root>
      </Box>
    </Theme>
  );
}

export default DocumentationPage;
