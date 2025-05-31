'use client';
import { ExclamationTriangleIcon, HomeIcon } from '@radix-ui/react-icons';
import { Box, Card, Flex, Text, Button } from '@radix-ui/themes';
import { Animate } from 'animation-library-test-abdullah-altun';
import Link from 'next/link';

export default function ErrorPage() {
  return (
    <Box
      className="min-h-screen"
      style={{
        background:
          'radial-gradient(circle at 50% 50%, var(--gray-2) 0%, var(--gray-1) 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-4)',
      }}
      data-cy="error-page"
    >
      <Animate type="fade" duration={0.6}>
        <Card
          size="4"
          variant="classic"
          style={{
            maxWidth: '480px',
            width: '100%',
            boxShadow: 'var(--shadow-6)',
          }}
        >
          <Flex direction="column" gap="6" align="center" p="6">
            <Animate type="bounce" duration={0.8} delay={0.4}>
              <Box
                style={{
                  padding: 'var(--space-4)',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--red-3)',
                  border: '2px solid var(--red-6)',
                }}
              >
                <ExclamationTriangleIcon
                  width="32"
                  height="32"
                  color="var(--red-9)"
                  data-cy="error-icon"
                />
              </Box>
            </Animate>

            <Flex direction="column" gap="3" align="center">
              <Text
                size="8"
                weight="bold"
                color="gray"
                style={{ letterSpacing: '-0.02em' }}
                data-cy="error-title"
              >
                404
              </Text>
              <Text
                size="5"
                weight="medium"
                color="gray"
                style={{ textAlign: 'center' }}
              >
                Page Not Found
              </Text>
            </Flex>

            <Text
              size="3"
              color="gray"
              style={{
                textAlign: 'center',
                lineHeight: '1.6',
                maxWidth: '320px',
              }}
              data-cy="error-message"
            >
              Sorry, we couldn't find the page you're looking for. The page may
              have been moved, deleted, or the URL might be incorrect.
            </Text>

            <Animate type="slide" duration={0.6} delay={0.4} axis="y">
              <Link href="/" style={{ textDecoration: 'none' }}>
                <Button
                  size="3"
                  variant="solid"
                  style={{
                    cursor: 'pointer',
                    minWidth: '140px',
                  }}
                  data-cy="home-link"
                >
                  <HomeIcon width="16" height="16" />
                  Return Home
                </Button>
              </Link>
            </Animate>
          </Flex>
        </Card>
      </Animate>
    </Box>
  );
}
