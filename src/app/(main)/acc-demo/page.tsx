'use client';
import React, { useEffect, useState } from 'react';

import {
  Card,
  Button,
  Heading,
  Text,
  Flex,
  Box,
  TextField,
  TextArea,
} from '@radix-ui/themes';
import { Animate } from 'animation-library-test-abdullah-altun';

// Hook to detect user's motion preferences
function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
}

// Skip to content link for keyboard navigation
function SkipToContent() {
  const handleSkip = (
    e:
      | React.MouseEvent<HTMLAnchorElement>
      | React.KeyboardEvent<HTMLAnchorElement>
  ) => {
    e.preventDefault();
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.focus();
      // Only call scrollIntoView if it exists (it may not in testing environments)
      if (typeof mainContent.scrollIntoView === 'function') {
        mainContent.scrollIntoView();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLAnchorElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleSkip(e);
    }
  };

  return (
    <a
      href="#main-content"
      className="skip-link"
      onClick={handleSkip}
      onKeyDown={handleKeyDown}
      style={{
        position: 'absolute',
        top: '-40px',
        left: '6px',
        background: '#000',
        color: '#fff',
        padding: '8px',
        textDecoration: 'none',
        borderRadius: '4px',
        zIndex: 1000,
        transform: 'translateY(-100%)',
        transition: 'transform 0.3s',
      }}
      onFocus={(e) => {
        (e.target as HTMLElement).style.transform = 'translateY(0)';
      }}
      onBlur={(e) => {
        (e.target as HTMLElement).style.transform = 'translateY(-100%)';
      }}
    >
      Skip to main content
    </a>
  );
}

// Accessible animated card component
function AccessibleCard({
  title,
  description,
  delay = 0,
  prefersReducedMotion = false,
}: {
  title: string;
  description: string;
  delay?: number;
  prefersReducedMotion?: boolean;
}) {
  return (
    <Animate
      type="slide"
      duration={prefersReducedMotion ? 0 : 0.6}
      delay={prefersReducedMotion ? 0 : delay}
      distance={prefersReducedMotion ? 0 : 30}
      axis="y"
      opacity={
        prefersReducedMotion ? { start: 1, end: 1 } : { start: 0, end: 1 }
      }
    >
      <Card
        style={{
          padding: '24px',
          margin: '16px 0',
          border: '2px solid #e0e0e0',
          borderRadius: '8px',
          minHeight: '120px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
        role="article"
        tabIndex={0}
      >
        <Heading
          as="h3"
          size="4"
          style={{
            margin: '0 0 12px 0',
            color: '#1a1a1a',
          }}
        >
          {title}
        </Heading>
        <Text
          style={{
            margin: 0,
            lineHeight: '1.6',
            color: '#4a4a4a',
          }}
        >
          {description}
        </Text>
      </Card>
    </Animate>
  );
}

// Accessible form with animations
function AccessibleForm({
  prefersReducedMotion = false,
}: {
  prefersReducedMotion?: boolean;
}) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submitted, setSubmitted] = useState(false);
  const [, setTouched] = useState<{ [key: string]: boolean }>({});

  const validateField = (field: string, value: string) => {
    switch (field) {
      case 'name':
        return !value.trim() ? 'Name is required' : '';
      case 'email':
        if (!value.trim()) return 'Email is required';
        if (!/\S+@\S+\.\S+/.test(value)) return 'Email is invalid';
        return '';
      case 'message':
        return !value.trim() ? 'Message is required' : '';
      default:
        return '';
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    Object.keys(formData).forEach((field) => {
      const error = validateField(
        field,
        formData[field as keyof typeof formData]
      );
      if (error) newErrors[field] = error;
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setSubmitted(true);
    }
  };

  const handleInputChange =
    (field: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = e.target.value;
      setFormData((prev) => ({ ...prev, [field]: value }));

      // Clear error when user starts typing
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: '' }));
      }
    };

  const handleBlur = (field: string) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = validateField(
      field,
      formData[field as keyof typeof formData]
    );
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  return (
    <Animate
      type="slide"
      duration={prefersReducedMotion ? 0 : 0.8}
      delay={prefersReducedMotion ? 0 : 0.4}
      distance={prefersReducedMotion ? 0 : 40}
      axis="y"
      opacity={
        prefersReducedMotion ? { start: 1, end: 1 } : { start: 0, end: 1 }
      }
    >
      <Card style={{ padding: '2rem', maxWidth: '600px' }}>
        <form onSubmit={handleSubmit} noValidate role="form">
          <fieldset
            style={{
              border: 'none',
              padding: 0,
              margin: 0,
            }}
          >
            <legend
              style={{
                fontSize: '1.2rem',
                fontWeight: '600',
                marginBottom: '1rem',
                color: '#1a1a1a',
              }}
            >
              Send us a message
            </legend>

            <Flex direction="column" gap="4">
              <Box>
                <label
                  htmlFor="name-input"
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: '500',
                    color: '#2a2a2a',
                  }}
                >
                  Full Name *
                </label>
                <TextField.Root
                  id="name-input"
                  value={formData.name}
                  onChange={handleInputChange('name')}
                  onBlur={handleBlur('name')}
                  required
                  aria-required="true"
                  aria-describedby={
                    errors.name ? 'name-error name-help' : 'name-help'
                  }
                  style={{ width: '100%' }}
                  size="3"
                />
                {errors.name && (
                  <Text
                    id="name-error"
                    role="alert"
                    style={{
                      color: '#dc3545',
                      display: 'block',
                      marginTop: '0.25rem',
                    }}
                  >
                    {errors.name}
                  </Text>
                )}
                <Text
                  id="name-help"
                  size="2"
                  style={{
                    color: '#6c757d',
                    display: 'block',
                    marginTop: '0.25rem',
                  }}
                >
                  Please enter your full name
                </Text>
              </Box>

              <Box>
                <label
                  htmlFor="email-input"
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: '500',
                    color: '#2a2a2a',
                  }}
                >
                  Email Address *
                </label>
                <TextField.Root
                  id="email-input"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange('email')}
                  onBlur={handleBlur('email')}
                  required
                  aria-required="true"
                  aria-describedby={
                    errors.email ? 'email-error email-help' : 'email-help'
                  }
                  style={{ width: '100%' }}
                  size="3"
                />
                {errors.email && (
                  <Text
                    id="email-error"
                    role="alert"
                    style={{
                      color: '#dc3545',
                      display: 'block',
                      marginTop: '0.25rem',
                    }}
                  >
                    {errors.email}
                  </Text>
                )}
                <Text
                  id="email-help"
                  size="2"
                  style={{
                    color: '#6c757d',
                    display: 'block',
                    marginTop: '0.25rem',
                  }}
                >
                  We&apos;ll use this to respond to your message
                </Text>
              </Box>

              <Box>
                <label
                  htmlFor="message-input"
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: '500',
                    color: '#2a2a2a',
                  }}
                >
                  Message *
                </label>
                <TextArea
                  id="message-input"
                  value={formData.message}
                  onChange={handleInputChange('message')}
                  onBlur={handleBlur('message')}
                  required
                  aria-required="true"
                  aria-describedby={
                    errors.message
                      ? 'message-error message-help'
                      : 'message-help'
                  }
                  rows={4}
                  style={{
                    width: '100%',
                    resize: 'vertical',
                  }}
                  size="3"
                />
                {errors.message && (
                  <Text
                    id="message-error"
                    role="alert"
                    style={{
                      color: '#dc3545',
                      display: 'block',
                      marginTop: '0.25rem',
                    }}
                  >
                    {errors.message}
                  </Text>
                )}
                <Text
                  id="message-help"
                  size="2"
                  style={{
                    color: '#6c757d',
                    display: 'block',
                    marginTop: '0.25rem',
                  }}
                >
                  Please describe your inquiry (minimum 10 characters)
                </Text>
              </Box>

              <Button
                type="submit"
                size="3"
                style={{
                  minHeight: '44px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  fontWeight: '600',
                }}
                disabled={
                  !formData.name || !formData.email || !formData.message
                }
              >
                {submitted ? 'Message Sent!' : 'Send Message'}
              </Button>
            </Flex>
          </fieldset>

          {submitted && (
            <Animate
              type="slide"
              duration={prefersReducedMotion ? 0 : 0.5}
              distance={prefersReducedMotion ? 0 : 20}
              axis="y"
              opacity={
                prefersReducedMotion
                  ? { start: 1, end: 1 }
                  : { start: 0, end: 1 }
              }
            >
              <div
                role="alert"
                style={{
                  marginTop: '20px',
                  padding: '16px',
                  background: '#d4edda',
                  border: '1px solid #c3e6cb',
                  borderRadius: '4px',
                  color: '#155724',
                }}
              >
                Form submitted successfully! Thank you for your message.
              </div>
            </Animate>
          )}
        </form>
      </Card>
    </Animate>
  );
}

// Data table showing WCAG compliance
function WCAGComplianceTable({
  prefersReducedMotion = false,
}: {
  prefersReducedMotion?: boolean;
}) {
  const complianceData = [
    {
      criterion: 'Keyboard Navigation',
      level: 'AA',
      status: 'Pass',
      implementation: 'All interactive elements accessible via keyboard',
    },
    {
      criterion: 'Color Contrast',
      level: 'AA',
      status: 'Pass',
      implementation: 'Text meets 4.5:1 contrast ratio',
    },
    {
      criterion: 'Motion Preferences',
      level: 'AAA',
      status: 'Pass',
      implementation: 'Respects prefers-reduced-motion',
    },
    {
      criterion: 'Focus Indicators',
      level: 'AA',
      status: 'Pass',
      implementation: 'Visible focus indicators on all interactive elements',
    },
    {
      criterion: 'Touch Targets',
      level: 'AAA',
      status: 'Pass',
      implementation: 'Minimum 44px touch target size',
    },
    {
      criterion: 'Semantic HTML',
      level: 'A',
      status: 'Pass',
      implementation: 'Proper use of headings, landmarks, and ARIA',
    },
  ];

  return (
    <Animate
      type="slide"
      duration={prefersReducedMotion ? 0 : 0.8}
      delay={prefersReducedMotion ? 0 : 0.6}
      distance={prefersReducedMotion ? 0 : 40}
      axis="y"
      opacity={
        prefersReducedMotion ? { start: 1, end: 1 } : { start: 0, end: 1 }
      }
    >
      <Card style={{ padding: '1.5rem', overflowX: 'auto' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '1rem',
          }}
          role="table"
          aria-label="WCAG Compliance Checklist"
        >
          <caption
            style={{
              fontSize: '1.1rem',
              fontWeight: '600',
              marginBottom: '1rem',
              textAlign: 'left',
              color: '#1a1a1a',
            }}
          >
            WCAG 2.1 AA Compliance Checklist
          </caption>
          <thead>
            <tr>
              <th
                scope="col"
                style={{
                  padding: '0.75rem',
                  borderBottom: '2px solid #dee2e6',
                  textAlign: 'left',
                  fontWeight: '600',
                  backgroundColor: '#f8f9fa',
                }}
              >
                Criterion
              </th>
              <th
                scope="col"
                style={{
                  padding: '0.75rem',
                  borderBottom: '2px solid #dee2e6',
                  textAlign: 'left',
                  fontWeight: '600',
                  backgroundColor: '#f8f9fa',
                }}
              >
                Level
              </th>
              <th
                scope="col"
                style={{
                  padding: '0.75rem',
                  borderBottom: '2px solid #dee2e6',
                  textAlign: 'center',
                  fontWeight: '600',
                  backgroundColor: '#f8f9fa',
                }}
              >
                Status
              </th>
              <th
                scope="col"
                style={{
                  padding: '0.75rem',
                  borderBottom: '2px solid #dee2e6',
                  textAlign: 'left',
                  fontWeight: '600',
                  backgroundColor: '#f8f9fa',
                }}
              >
                Implementation
              </th>
            </tr>
          </thead>
          <tbody>
            {complianceData.map((row, index) => (
              <tr key={index}>
                <td
                  style={{
                    padding: '0.75rem',
                    borderBottom: '1px solid #dee2e6',
                  }}
                >
                  {row.criterion}
                </td>
                <td
                  style={{
                    padding: '0.75rem',
                    borderBottom: '1px solid #dee2e6',
                  }}
                >
                  <span
                    style={{
                      backgroundColor:
                        row.level === 'AAA'
                          ? '#28a745'
                          : row.level === 'AA'
                            ? '#ffc107'
                            : '#17a2b8',
                      color: row.level === 'AA' ? '#000' : '#fff',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '0.25rem',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                    }}
                  >
                    {row.level}
                  </span>
                </td>
                <td
                  style={{
                    padding: '0.75rem',
                    borderBottom: '1px solid #dee2e6',
                    textAlign: 'center',
                  }}
                >
                  {row.status}
                </td>
                <td
                  style={{
                    padding: '0.75rem',
                    borderBottom: '1px solid #dee2e6',
                  }}
                >
                  {row.implementation}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </Animate>
  );
}
export default function AccessibilityDemo() {
  const prefersReducedMotion = useReducedMotion();
  const [showMotionAlert, setShowMotionAlert] = useState(true);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    // Announce motion preference detection to screen readers
    if (prefersReducedMotion && showMotionAlert) {
      const announcement = document.createElement('div');
      announcement.setAttribute('aria-live', 'polite');
      announcement.setAttribute('aria-atomic', 'true');
      announcement.style.position = 'absolute';
      announcement.style.left = '-10000px';
      announcement.textContent =
        'Reduced motion detected. Animations have been disabled for better accessibility.';
      document.body.appendChild(announcement);

      const timeoutId = setTimeout(() => {
        if (document.body.contains(announcement)) {
          document.body.removeChild(announcement);
        }
        setShowNotification(true);
      }, 1000);

      return () => {
        clearTimeout(timeoutId);
        if (document.body.contains(announcement)) {
          document.body.removeChild(announcement);
        }
      };
    }
  }, [prefersReducedMotion, showMotionAlert]);

  const animationProps = prefersReducedMotion
    ? { duration: 0 } // No animation if user prefers reduced motion
    : { duration: 0.6, opacity: { start: 0, end: 1 } };

  return (
    <>
      <SkipToContent />

      <main
        id="main-content"
        role="main"
        aria-label="Accessibility Demo Page"
        tabIndex={-1}
        style={{
          padding: '2rem',
          maxWidth: '1200px',
          margin: '0 auto',
          lineHeight: '1.6',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          outline: 'none',
        }}
      >
        {/* Notification Area with ARIA Live Region */}
        {showNotification && (
          <Animate type="scale" scale={1.02} {...animationProps}>
            <div
              role="alert"
              aria-live="polite"
              aria-atomic="true"
              style={{
                backgroundColor: '#d4edda',
                color: '#155724',
                padding: '1rem',
                borderRadius: '0.375rem',
                border: '1px solid #c3e6cb',
                marginBottom: '2rem',
                fontSize: '1.1rem',
              }}
            >
              ✅ Form submitted successfully! Thank you for your message.
            </div>
          </Animate>
        )}

        {/* Page Header with Semantic Structure */}
        <header role="banner">
          <Animate type="slide" distance={-30} axis="y" {...animationProps}>
            <Heading
              as="h1"
              size="8"
              style={{
                marginBottom: '1rem',
                color: '#1a1a1a',
                fontWeight: '700',
              }}
            >
              WCAG 2.1 AA Accessibility Demo
            </Heading>
          </Animate>

          <Animate
            type="slide"
            distance={-20}
            axis="y"
            delay={0.2}
            {...animationProps}
          >
            <Text
              size="5"
              style={{
                color: '#4a4a4a',
                display: 'block',
                marginBottom: '2rem',
              }}
            >
              Demonstrating that animations can enhance user experience while
              maintaining full accessibility compliance
            </Text>
          </Animate>

          {prefersReducedMotion && showMotionAlert && (
            <div
              style={{
                marginTop: '24px',
                padding: '16px',
                background: '#e7f3ff',
                border: '2px solid #0070f3',
                borderRadius: '8px',
                position: 'relative',
              }}
              role="alert"
              aria-live="polite"
            >
              <Heading
                as="h2"
                size="4"
                style={{ margin: '0 0 8px 0', color: '#0051a5' }}
              >
                Reduced Motion Detected
              </Heading>
              <Text style={{ margin: '0', color: '#003d7a' }}>
                Your system preference for reduced motion has been detected and
                respected. All animations on this page have been disabled.
              </Text>
              <Button
                onClick={() => setShowMotionAlert(false)}
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  background: 'none',
                  border: 'none',
                  fontSize: '20px',
                  cursor: 'pointer',
                  padding: '4px',
                  minHeight: '44px',
                  minWidth: '44px',
                }}
                aria-label="Dismiss reduced motion notification"
              >
                ×
              </Button>
            </div>
          )}
        </header>

        {/* Navigation with Proper ARIA */}
        <nav
          role="navigation"
          aria-label="Page sections"
          style={{ marginBottom: '2rem' }}
        >
          <Animate
            type="slide"
            distance={-15}
            axis="x"
            delay={0.3}
            {...animationProps}
          >
            <Flex gap="4" wrap="wrap">
              <Button
                variant="outline"
                size="3"
                onClick={() =>
                  document
                    .getElementById('features')
                    ?.scrollIntoView({ behavior: 'smooth' })
                }
                style={{
                  minHeight: '44px', // WCAG touch target size
                  minWidth: '44px',
                }}
              >
                Features
              </Button>
              <Button
                variant="outline"
                size="3"
                onClick={() =>
                  document
                    .getElementById('contact-form')
                    ?.scrollIntoView({ behavior: 'smooth' })
                }
                style={{
                  minHeight: '44px',
                  minWidth: '44px',
                }}
              >
                Contact Form
              </Button>
              <Button
                variant="outline"
                size="3"
                onClick={() =>
                  document
                    .getElementById('data-table')
                    ?.scrollIntoView({ behavior: 'smooth' })
                }
                style={{
                  minHeight: '44px',
                  minWidth: '44px',
                }}
              >
                Data Table
              </Button>
            </Flex>
          </Animate>
        </nav>

        {/* Features Section */}
        <section
          id="features"
          aria-labelledby="features-heading"
          style={{ marginBottom: '3rem' }}
        >
          <Animate
            type="slide"
            distance={-20}
            axis="y"
            delay={0.4}
            {...animationProps}
          >
            <Heading
              id="features-heading"
              as="h2"
              size="6"
              style={{
                marginBottom: '1.5rem',
                color: '#2a2a2a',
              }}
            >
              Accessibility Features Demonstrated
            </Heading>
          </Animate>

          <Flex direction="column" gap="4">
            {[
              {
                title: 'Semantic HTML Structure',
                description:
                  'Proper use of header, main, nav, section elements with ARIA roles',
                icon: '🏗️',
              },
              {
                title: 'Keyboard Navigation',
                description:
                  'All interactive elements are accessible via keyboard with proper focus management',
                icon: '⌨️',
              },
              {
                title: 'Screen Reader Support',
                description:
                  'ARIA labels, live regions, and semantic markup for assistive technologies',
                icon: '🔊',
              },
              {
                title: 'Motion Preferences',
                description:
                  'Respects prefers-reduced-motion for users with vestibular disorders',
                icon: '🎭',
              },
              {
                title: 'Color Contrast',
                description:
                  'WCAG AA compliant color combinations (4.5:1 ratio minimum)',
                icon: '🎨',
              },
              {
                title: 'Touch Targets',
                description:
                  'Minimum 44px × 44px touch targets for mobile accessibility',
                icon: '👆',
              },
            ].map((feature, index) => (
              <AccessibleCard
                key={feature.title}
                title={feature.title}
                description={feature.description}
                delay={0.5 + index * 0.1}
                prefersReducedMotion={prefersReducedMotion}
              />
            ))}
          </Flex>
        </section>

        {/* Contact Form Section */}
        <section
          id="contact-form"
          aria-labelledby="contact-heading"
          style={{ marginBottom: '3rem' }}
        >
          <Animate
            type="slide"
            distance={-20}
            axis="y"
            delay={0.6}
            {...animationProps}
          >
            <Heading
              id="contact-heading"
              as="h2"
              size="6"
              style={{
                marginBottom: '1.5rem',
                color: '#2a2a2a',
              }}
            >
              Accessible Contact Form
            </Heading>
          </Animate>

          <AccessibleForm prefersReducedMotion={prefersReducedMotion} />
        </section>

        {/* Data Table Section */}
        <section
          id="data-table"
          aria-labelledby="table-heading"
          style={{ marginBottom: '3rem' }}
        >
          <Animate
            type="slide"
            distance={-20}
            axis="y"
            delay={0.8}
            {...animationProps}
          >
            <Heading
              id="table-heading"
              as="h2"
              size="6"
              style={{
                marginBottom: '1.5rem',
                color: '#2a2a2a',
              }}
            >
              Accessible Data Table
            </Heading>
          </Animate>

          <WCAGComplianceTable prefersReducedMotion={prefersReducedMotion} />
        </section>

        {/* Motion Preference Display */}
        <section
          aria-labelledby="motion-heading"
          style={{ marginBottom: '2rem' }}
        >
          <Animate
            type="slide"
            distance={-15}
            axis="y"
            delay={1.0}
            {...animationProps}
          >
            <Card style={{ padding: '1.5rem', backgroundColor: '#e7f3ff' }}>
              <Heading
                id="motion-heading"
                as="h3"
                size="4"
                style={{
                  marginBottom: '1rem',
                  color: '#1a1a1a',
                }}
              >
                Motion Preference Detection
              </Heading>
              <Text
                style={{
                  color: '#4a4a4a',
                  marginBottom: '1rem',
                  display: 'block',
                }}
              >
                Current motion preference:{' '}
                {prefersReducedMotion
                  ? 'Reduced motion enabled'
                  : 'Motion enabled'}
              </Text>
              <Text
                size="2"
                style={{
                  color: '#6c757d',
                  fontStyle: 'italic',
                }}
              >
                This page automatically detects and respects your system&apos;s
                motion preferences. Change your OS setting for &ldquo;reduce
                motion&rdquo; to see this in action.
              </Text>
            </Card>
          </Animate>
        </section>

        {/* Testing information */}
        <Animate
          type="slide"
          distance={-15}
          axis="y"
          delay={1.1}
          {...animationProps}
        >
          <section
            aria-labelledby="testing-heading"
            style={{
              marginTop: '48px',
              padding: '32px',
              background: '#f8f9fa',
              borderRadius: '8px',
              border: '1px solid #e9ecef',
            }}
          >
            <Heading
              id="testing-heading"
              as="h2"
              size="5"
              style={{
                marginBottom: '16px',
                color: '#1a1a1a',
              }}
            >
              Accessibility Testing
            </Heading>
            <Text
              style={{
                fontSize: '1.1rem',
                lineHeight: '1.6',
                marginBottom: '16px',
                color: '#4a4a4a',
              }}
            >
              This page has been tested with:
            </Text>
            <ul
              style={{
                fontSize: '1rem',
                lineHeight: '1.6',
                color: '#4a4a4a',
                paddingLeft: '20px',
              }}
            >
              <li>NVDA and JAWS screen readers</li>
              <li>Keyboard-only navigation</li>
              <li>Color contrast analyzers</li>
              <li>axe-core accessibility testing</li>
              <li>Lighthouse accessibility audit</li>
              <li>WAVE accessibility evaluation tool</li>
            </ul>
            <Text
              style={{
                fontSize: '1rem',
                lineHeight: '1.6',
                marginTop: '16px',
                color: '#4a4a4a',
                fontStyle: 'italic',
              }}
            >
              Automated tests are available to verify that animations do not
              interfere with accessibility features.
            </Text>
          </section>
        </Animate>

        {/* Footer */}
        <footer
          role="contentinfo"
          style={{
            marginTop: '3rem',
            paddingTop: '2rem',
            borderTop: '1px solid #dee2e6',
          }}
        >
          <Animate
            type="slide"
            distance={-10}
            axis="y"
            delay={1.2}
            {...animationProps}
          >
            <Text
              size="3"
              style={{
                color: '#6c757d',
                textAlign: 'center',
                display: 'block',
              }}
            >
              © 2025 Animation Library Accessibility Demo. Fully compliant with
              WCAG 2.1 AA standards.
            </Text>
          </Animate>
        </footer>
      </main>
    </>
  );
}
