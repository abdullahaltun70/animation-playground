'use client';

import React from 'react';

import { Card } from '@radix-ui/themes';
import { Animate } from 'animation-library-test-abdullah-altun';

/**
 * Test page for the enhanced animation component
 * Demonstrates the simplified API and improved directional logic
 */
export default function TestPage() {
  return (
    <div
      style={{
        padding: '40px',
        maxWidth: '1200px',
        margin: '0 auto',
        color: 'blue',
      }}
    >
      <h2>Using Animate comp directly</h2>
      <div style={{ display: 'flex', gap: '20px', marginBottom: '40px' }}>
        <Animate type="bounce" duration={0.5} delay={0.9} distance={50}>
          <Animate type="slide" duration={1} delay={0} distance={-200}>
            <Animate type="rotate" duration={0.4} delay={1.5} degrees={180}>
              <div
                style={{
                  padding: '20px',
                  background: '#e8eaf6',
                  borderRadius: '8px',
                  width: '300px',
                }}
              >
                Combined Bounce + Slide + Rotate
              </div>
            </Animate>
          </Animate>
        </Animate>
      </div>

      <h2>Using Wrappers (composition not working!)</h2>
      <div style={{ display: 'flex', gap: '20px', marginBottom: '40px' }}>
        <ScaleAnimationWrapper>
          <SlideAnimationWrapper>
            <RotateAnimationWrapper>
              <div
                style={{
                  padding: '20px',
                  background: '#e8eaf6',
                  borderRadius: '8px',
                  width: '300px',
                }}
              >
                Combined Scale + Slide + Rotate
              </div>
            </RotateAnimationWrapper>
          </SlideAnimationWrapper>
        </ScaleAnimationWrapper>
      </div>

      <h1>Enhanced Animation Component Test</h1>
      <p>
        This page demonstrates the simplified API and improved directional logic
        for animations.
      </p>

      <h2>Fade Animation</h2>
      <div style={{ display: 'flex', gap: '20px', marginBottom: '40px' }}>
        <Animate
          type="fade"
          duration={1}
          delay={0.2}
          opacity={{ start: 0, end: 1 }}
        >
          <Card
            style={{
              padding: '20px',
              background: '#f0f0f0',
              borderRadius: '8px',
              width: '200px',
            }}
          >
            Fade In
          </Card>
        </Animate>
      </div>

      <h2>Slide Animation (Direction by sign)</h2>
      <div style={{ display: 'flex', gap: '20px', marginBottom: '40px' }}>
        <Animate
          type="slide"
          duration={1}
          delay={0.2}
          distance={100} // Positive = right
        >
          <div
            style={{
              padding: '20px',
              background: '#e0f7fa',
              borderRadius: '8px',
              width: '200px',
            }}
          >
            Slide from Right (+100)
          </div>
        </Animate>

        <Animate
          type="slide"
          duration={1}
          delay={0.2}
          distance={-100} // Negative = left
        >
          <div
            style={{
              padding: '20px',
              background: '#e0f7fa',
              borderRadius: '8px',
              width: '200px',
            }}
          >
            Slide from Left (-100)
          </div>
        </Animate>
      </div>

      <h2>Scale Animation</h2>
      <div style={{ display: 'flex', gap: '20px', marginBottom: '40px' }}>
        <Animate type="scale" duration={1} delay={0.2} scale={0.5}>
          <div
            style={{
              padding: '20px',
              background: '#f9fbe7',
              borderRadius: '8px',
              width: '200px',
            }}
          >
            Scale (0.5 to 1)
          </div>
        </Animate>
      </div>

      <h2>Rotate Animation (Direction by sign)</h2>
      <div style={{ display: 'flex', gap: '20px', marginBottom: '40px' }}>
        <Animate
          type="rotate"
          duration={1}
          delay={0.2}
          degrees={180} // Positive = clockwise
        >
          <div
            style={{
              padding: '20px',
              background: '#fff3e0',
              borderRadius: '8px',
              width: '200px',
            }}
          >
            Rotate Clockwise (+180°)
          </div>
        </Animate>

        <Animate
          type="rotate"
          duration={1}
          delay={0.2}
          degrees={-180} // Negative = counter-clockwise
        >
          <div
            style={{
              padding: '20px',
              background: '#fff3e0',
              borderRadius: '8px',
              width: '200px',
            }}
          >
            Rotate Counter-clockwise (-180°)
          </div>
        </Animate>
      </div>

      <h2>Bounce Animation (Direction by sign)</h2>
      <div style={{ display: 'flex', gap: '20px', marginBottom: '40px' }}>
        <Animate
          type="bounce"
          duration={1}
          delay={0.2}
          distance={30} // Positive = up
        >
          <div
            style={{
              padding: '20px',
              background: '#f3e5f5',
              borderRadius: '8px',
              width: '200px',
            }}
          >
            Bounce Up (+30)
          </div>
        </Animate>

        <Animate
          type="bounce"
          duration={1}
          delay={0.2}
          distance={-30} // Negative = down
        >
          <div
            style={{
              padding: '20px',
              background: '#f3e5f5',
              borderRadius: '8px',
              width: '200px',
            }}
          >
            Bounce Down (-30)
          </div>
        </Animate>
      </div>

      <h2>Custom Easing Example</h2>
      <div style={{ display: 'flex', gap: '20px', marginBottom: '40px' }}>
        <Animate
          type="bounce"
          duration={1.2}
          delay={0.3}
          easing="cubic-bezier(0.175, 0.885, 0.32, 1.275)"
          distance={50}
        >
          <div
            style={{
              padding: '20px',
              background: '#fce4ec',
              borderRadius: '8px',
              width: '200px',
            }}
          >
            Bounce with Custom Easing
          </div>
        </Animate>
      </div>
    </div>
  );
}
// Example component using the generated animation: scale
export const ScaleAnimationWrapper = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  // Wrap the content you want to animate with the <Animate> component.
  // Make sure the direct child can accept a ref (like a standard HTML element or forwardRef component).
  return (
    <Animate
      type="scale"
      easing="cubic-bezier(0.175, 0.885, 0.32, 1.275)"
      scale={2}
    >
      {children}
    </Animate>
  );
};

// Example component using the generated animation: slide
export const SlideAnimationWrapper = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  // Wrap the content you want to animate with the <Animate> component.
  // Make sure the direct child can accept a ref (like a standard HTML element or forwardRef component).
  return (
    <Animate
      type="slide"
      easing="cubic-bezier(0.175, 0.885, 0.32, 1.275)"
      distance={-158}
    >
      {children}
    </Animate>
  );
};

// Example component using the generated animation: rotate
export const RotateAnimationWrapper = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  // Wrap the content you want to animate with the <Animate> component.
  // Make sure the direct child can accept a ref (like a standard HTML element or forwardRef component).
  return (
    <Animate type="rotate" easing="cubic-bezier(0.175, 0.885, 0.32, 1.275)">
      {children}
    </Animate>
  );
};
