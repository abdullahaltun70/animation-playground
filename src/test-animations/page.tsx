'use client';

import React from 'react';

import { Card } from '@radix-ui/themes';

// import { Animate } from '../../node_modules/animation-library-test-abdullah-altun/src/components/Animate';
import Animate from '@/app/(main)/documentation/Animate';

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
        color: 'red',
      }}
    >
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

      <h2>Composition Example</h2>
      <div style={{ display: 'flex', gap: '20px', marginBottom: '40px' }}>
        <Animate
          type="fade"
          duration={1.2}
          delay={0.3}
          easing="cubic-bezier(0.175, 0.885, 0.32, 1.275)"
        >
          <Animate type="bounce" duration={1} delay={0.5} distance={50}>
            {/* De 'bounce' wordt overridden door de 'fade' */}
            <Animate type="slide" duration={1} delay={0.5} distance={-200}>
              <div
                style={{
                  padding: '20px',
                  background: '#e8eaf6',
                  borderRadius: '8px',
                  width: '300px',
                }}
              >
                Combined Fade + Slide from Left
              </div>
            </Animate>
          </Animate>
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
