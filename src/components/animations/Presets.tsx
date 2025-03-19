// src/components/animations/Presets.tsx
import React, { ReactNode } from 'react';

import { Animation, AnimationProps } from './Animation';

// Helper type for preset props
type PresetProps = Omit<AnimationProps, 'name'> & {
	children: ReactNode;
};

// Fade animations
export const FadeIn: React.FC<PresetProps> = (props) => (
	<Animation
		name="fadeIn"
		{...props}
		style={{ transform: 'translateX(100px)' }}
	/>
);

export const FadeOut: React.FC<PresetProps> = (props) => (
	<Animation name="fadeOut" {...props} />
);

// Slide animations
export const SlideInLeft: React.FC<PresetProps> = (props) => (
	<Animation name="slideInLeft" {...props} />
);

export const SlideInRight: React.FC<PresetProps> = (props) => (
	<Animation name="slideInRight" {...props} />
);

export const SlideInUp: React.FC<PresetProps> = (props) => (
	<Animation name="slideInUp" {...props} />
);

export const SlideInDown: React.FC<PresetProps> = (props) => (
	<Animation name="slideInDown" {...props} />
);

// Other animations
export const Bounce: React.FC<PresetProps> = (props) => (
	<Animation name="bounceIn" {...props} />
);

export const Pulse: React.FC<PresetProps> = (props) => (
	<Animation name="pulse" iterationCount="infinite" {...props} />
);
