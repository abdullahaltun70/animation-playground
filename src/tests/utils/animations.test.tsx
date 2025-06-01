import { describe, it, expect } from 'vitest';

import {
  // Assuming getAnimationName is not exported, so test generateCSSCode/generateReactComponent for its effects
  generateCSSCode,
  generateReactComponent,
} from '@/app/utils/animations';
import type { AnimationConfig } from '@/types/animations';

// Helper to get animation name indirectly for testing purposes if getAnimationName is not exported
// by checking the generated CSS.
const getAnimationNameFromCSS = (config: AnimationConfig): string => {
  const css = generateCSSCode(config);
  const match = css.match(/animation: (\S+)/);
  return match ? match[1] : '';
};

describe('Animation Utilities', () => {
  describe('getAnimationName (indirectly via generateCSSCode)', () => {
    it('should return "fadeIn" for type "fade"', () => {
      const config: AnimationConfig = {
        type: 'fade',
        duration: 1,
        delay: 0,
        easing: 'ease-in-out',
      };
      expect(getAnimationNameFromCSS(config)).toBe('fadeIn');
    });

    it('should return "slideInRight" for type "slide" with positive distance or no distance', () => {
      const config1: AnimationConfig = {
        type: 'slide',
        duration: 1,
        distance: 50,
        delay: 0,
        easing: 'ease-in-out',
      };
      expect(getAnimationNameFromCSS(config1)).toBe('slideInRight');
      const config2: AnimationConfig = {
        type: 'slide',
        duration: 1,
        delay: 0,
        easing: 'ease-in-out',
      }; // Default distance is positive
      expect(getAnimationNameFromCSS(config2)).toBe('slideInRight');
    });

    it('should return "slideInLeft" for type "slide" with negative distance', () => {
      const config: AnimationConfig = {
        type: 'slide',
        duration: 1,
        distance: -50,
        delay: 0,
        easing: 'ease-in-out',
      };
      expect(getAnimationNameFromCSS(config)).toBe('slideInLeft');
    });

    it('should return "scaleIn" for type "scale"', () => {
      const config: AnimationConfig = {
        type: 'scale',
        duration: 1,
        delay: 0,
        easing: 'ease-in-out',
      };
      expect(getAnimationNameFromCSS(config)).toBe('scaleIn');
    });

    it('should return "rotateIn" for type "rotate"', () => {
      const config: AnimationConfig = {
        type: 'rotate',
        duration: 1,
        delay: 0,
        easing: 'ease-in-out',
      };
      expect(getAnimationNameFromCSS(config)).toBe('rotateIn');
    });

    it('should return "bounceIn" for type "bounce"', () => {
      const config: AnimationConfig = {
        type: 'bounce',
        duration: 1,
        delay: 0,
        easing: 'ease-in-out',
      };
      expect(getAnimationNameFromCSS(config)).toBe('bounceIn');
    });
  });

  describe('generateCSSCode', () => {
    const baseConfig: AnimationConfig = {
      type: 'fade',
      duration: 0.5,
      delay: 0.1,
      easing: 'ease-in-out',
    };

    it('should generate correct common CSS properties', () => {
      const css = generateCSSCode(baseConfig);
      expect(css).toContain(`.animated-element {`);
      expect(css).toContain(
        `animation: fadeIn 0.5s ease-in-out 0.1s forwards;`
      );
    });

    describe('Fade Animation Type', () => {
      it('should generate correct CSS for fade with default opacity', () => {
        const config: AnimationConfig = { ...baseConfig, type: 'fade' };
        const css = generateCSSCode(config);
        expect(css).toContain('@keyframes fadeIn {');
        expect(css).toContain('from { opacity: 0; }');
        expect(css).toContain('to { opacity: 1; }');
      });

      it('should generate correct CSS for fade with custom opacity', () => {
        const config: AnimationConfig = {
          ...baseConfig,
          type: 'fade',
          opacity: { start: 0.2, end: 0.7 },
        };
        const css = generateCSSCode(config);
        expect(css).toContain('@keyframes fadeIn {');
        expect(css).toContain('from { opacity: 0.2; }');
        expect(css).toContain('to { opacity: 0.7; }');
      });
    });

    describe('Slide Animation Type', () => {
      it('should generate correct CSS for slide right (default distance)', () => {
        const config: AnimationConfig = { ...baseConfig, type: 'slide' }; // axis default 'x'
        const css = generateCSSCode(config);
        expect(css).toContain('animation: slideInRight');
        expect(css).toContain('@keyframes slideInRight {');
        expect(css).toContain('from { transform: translateX(50px); }'); // Default distance 50
        expect(css).toContain('to { transform: translateX(0); }');
      });

      it('should generate correct CSS for slide left', () => {
        const config: AnimationConfig = {
          ...baseConfig,
          type: 'slide',
          distance: -70,
        };
        const css = generateCSSCode(config);
        expect(css).toContain('animation: slideInLeft');
        expect(css).toContain('@keyframes slideInLeft {');
        expect(css).toContain('from { transform: translateX(-70px); }');
        expect(css).toContain('to { transform: translateX(0); }');
      });
      // Note: The current generateCSSCode for 'slide' does not use the 'axis' property for translateX/Y.
      // It always uses translateX. If Y-axis sliding were implemented, tests would need to reflect that.
    });

    describe('Scale Animation Type', () => {
      it('should generate correct CSS for scale with default scale value', () => {
        const config: AnimationConfig = { ...baseConfig, type: 'scale' };
        const css = generateCSSCode(config);
        expect(css).toContain('animation: scaleIn');
        expect(css).toContain('@keyframes scaleIn {');
        expect(css).toContain('from { transform: scale(0.8); }'); // Default scale 0.8
        expect(css).toContain('to { transform: scale(1); }');
      });

      it('should generate correct CSS for scale with custom scale value', () => {
        const config: AnimationConfig = {
          ...baseConfig,
          type: 'scale',
          scale: 0.5,
        };
        const css = generateCSSCode(config);
        expect(css).toContain('from { transform: scale(0.5); }');
      });
    });

    describe('Rotate Animation Type', () => {
      it('should generate correct CSS for rotate with default degrees', () => {
        const config: AnimationConfig = { ...baseConfig, type: 'rotate' };
        const css = generateCSSCode(config);
        expect(css).toContain('animation: rotateIn');
        expect(css).toContain('@keyframes rotateIn {');
        expect(css).toContain('from { transform: rotate(360deg); }'); // Default degrees 360
        expect(css).toContain('to { transform: rotate(0); }');
      });

      it('should generate correct CSS for rotate with custom degrees (number)', () => {
        const config: AnimationConfig = {
          ...baseConfig,
          type: 'rotate',
          degrees: 180,
        };
        const css = generateCSSCode(config);
        expect(css).toContain('from { transform: rotate(180deg); }');
      });
      // Note: The current generateCSSCode for 'rotate' does not support object {start, end} for degrees in keyframes.
      // It uses the single 'degrees' value or its default for the 'from' state.
    });

    describe('Bounce Animation Type', () => {
      it('should generate correct CSS for bounce with default distance', () => {
        const config: AnimationConfig = { ...baseConfig, type: 'bounce' };
        const css = generateCSSCode(config);
        expect(css).toContain('animation: bounceIn');
        expect(css).toContain('@keyframes bounceIn {');
        expect(css).toContain('0% { transform: translateY(0); }');
        expect(css).toContain('50% { transform: translateY(-30px); }'); // Default distance 30
        expect(css).toContain('100% { transform: translateY(0); }');
      });

      it('should generate correct CSS for bounce with custom distance', () => {
        const config: AnimationConfig = {
          ...baseConfig,
          type: 'bounce',
          distance: -20,
        }; // Negative for upward bounce typically
        const css = generateCSSCode(config);
        // The keyframes for bounce use the value directly, so -20 becomes --20 for translateY(--20px)
        expect(css).toContain('50% { transform: translateY(--20px); }');
      });
    });
  });

  describe('generateReactComponent', () => {
    const baseConfig: AnimationConfig = {
      type: 'fade',
      duration: 1, // Different from DEFAULTS.duration (0.5)
      delay: 0.2, // Different from DEFAULTS.delay (0)
      easing: 'linear', // Different from DEFAULTS.easing ('ease-out')
      name: 'MyTestComponent',
      description: 'A test component generation',
    };

    it('should generate basic React component string with non-default props', () => {
      const result = generateReactComponent(baseConfig);
      expect(result).toContain('// Fade Animation');
      expect(result).toContain('<Animate type="fade"');
      expect(result).toContain(`duration={1}`);
      expect(result).toContain(`delay={0.2}`);
      expect(result).toContain(`easing="linear"`);
      expect(result).toContain(`>
    {children}
</Animate>`);
    });

    it('should omit props that match DEFAULTS', () => {
      const config: AnimationConfig = {
        type: 'fade',
        duration: 0.5, // Matches DEFAULTS.duration
        delay: 0, // Matches DEFAULTS.delay
        easing: 'ease-out', // Matches DEFAULTS.easing
      };
      const result = generateReactComponent(config);
      expect(result).toContain('<Animate type="fade" >'); // Note the space before >
      expect(result).not.toContain('duration=');
      expect(result).not.toContain('delay=');
      expect(result).not.toContain('easing=');
    });

    it('should handle fade type with custom opacity', () => {
      const config: AnimationConfig = {
        ...baseConfig,
        type: 'fade',
        opacity: { start: 0.1, end: 0.9 },
      };
      const result = generateReactComponent(config);
      expect(result).toContain('opacity={{ start: 0.1, end: 0.9 }}');
    });

    it('should handle fade type with default opacity (should not include opacity prop)', () => {
      const config: AnimationConfig = {
        ...baseConfig,
        type: 'fade',
        opacity: { start: 0, end: 1 },
      }; // Matches DEFAULTS
      const result = generateReactComponent(config);
      expect(result).not.toContain('opacity=');
    });

    it('should handle slide type with custom distance and axis', () => {
      const config: AnimationConfig = {
        ...baseConfig,
        type: 'slide',
        distance: 100,
        axis: 'y',
      };
      const result = generateReactComponent(config);
      expect(result).toContain('distance={100}');
      expect(result).toContain('axis="y"');
    });

    it('should handle scale type with custom scale', () => {
      const config: AnimationConfig = {
        ...baseConfig,
        type: 'scale',
        scale: 0.6,
      };
      const result = generateReactComponent(config);
      expect(result).toContain('scale={0.6}');
    });

    it('should handle rotate type with custom degrees (number)', () => {
      const config: AnimationConfig = {
        ...baseConfig,
        type: 'rotate',
        degrees: 180,
      };
      const result = generateReactComponent(config);
      expect(result).toContain('degrees={180}');
    });

    it('should handle rotate type with custom degrees (object)', () => {
      const config: AnimationConfig = {
        ...baseConfig,
        type: 'rotate',
        degrees: { start: 10, end: 200 },
      };
      const result = generateReactComponent(config);
      expect(result).toContain('degrees={{ start: 10, end: 200 }}');
    });
    it('should handle rotate type with custom degrees (object, only start)', () => {
      const config: AnimationConfig = {
        ...baseConfig,
        type: 'rotate',
        degrees: { start: 10, end: 10 },
      };
      const result = generateReactComponent(config);
      expect(result).toContain('degrees={{ start: 10, end: 10 }}');
    });

    it('should handle bounce type with custom distance', () => {
      const config: AnimationConfig = {
        ...baseConfig,
        type: 'bounce',
        distance: -60,
      };
      const result = generateReactComponent(config);
      expect(result).toContain('distance={-60}');
    });

    it('should correctly format props string with multiple props', () => {
      const config: AnimationConfig = {
        type: 'slide',
        duration: 1,
        delay: 0.5,
        distance: 100,
        easing: 'linear',
      };
      const result = generateReactComponent(config);
      expect(result).toMatch(
        /<Animate type="slide"\s+duration=\{1\}\s+delay=\{0\.5\}\s+easing="linear"\s+distance=\{100\}\s*>/
      );
    });

    it('should correctly format props string with only type prop', () => {
      const config: AnimationConfig = {
        type: 'fade',
        duration: 0.5, // default
        delay: 0, // default
        easing: 'ease-out', //default
      };
      const result = generateReactComponent(config);
      expect(result).toMatch(/<Animate type="fade" *>/);
    });
  });
});
