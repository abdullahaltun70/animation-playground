'use client';

import React from 'react';

import { Theme, Box } from '@radix-ui/themes';

function DocumentationPage() {
  return (
    <Theme accentColor="indigo" grayColor="slate">
      <Box
        style={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <iframe
          src="https://docs.page/abdullahaltun70/animation-playground"
          title="Animation Library Documentation"
          style={{ width: '100vw', height: '100vh', border: 'none' }}
        />
      </Box>
    </Theme>
  );
}

export default DocumentationPage;
