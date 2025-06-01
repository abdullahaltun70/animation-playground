'use client';

import React from 'react';

import { Theme, Box } from '@radix-ui/themes';

function DocumentationPage() {
  return (
    <Theme accentColor="indigo" grayColor="slate">
      <Box
        style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
        }}
      >
        <iframe
          src="https://docs.page/abdullahaltun70/animation-playground"
          title="Animation Library Documentation"
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            minHeight: '85vh',
          }}
        />
      </Box>
    </Theme>
  );
}

export default DocumentationPage;
