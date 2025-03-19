// src/components/animations/Animation.tsx
import React, { ReactNode, isValidElement, cloneElement } from 'react';

import 'animation-library-test-abdullah-altun';

export interface AnimationProps {
	name: string;
	duration?: number;
	delay?: number;
	easing?: string;
	fillMode?: 'forwards' | 'backwards' | 'both' | 'none';
	iterationCount?: number | 'infinite';
	direction?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
	children: ReactNode;
	className?: string;
	style?: React.CSSProperties;
	onAnimationStart?: () => void;
	onAnimationEnd?: () => void;
}

export const Animation: React.FC<AnimationProps> = ({
	name,
	duration = 1,
	delay = 0,
	easing = 'ease',
	fillMode = 'forwards',
	iterationCount = 1,
	direction = 'normal',
	children,
	className,
	style,
	onAnimationStart,
	onAnimationEnd,
}) => {
	const animationStyle: React.CSSProperties = {
		...style,
		animationName: name,
		animationDuration: `${duration}s`,
		animationDelay: `${delay}s`,
		animationTimingFunction: easing,
		animationFillMode: fillMode,
		animationIterationCount: iterationCount,
		animationDirection: direction,
	};

	if (isValidElement(children)) {
		// Use type assertion to tell TypeScript this is a React element with props
		return cloneElement(children, {
			style: {
				...(children.props.style || {}),
				...animationStyle,
			},
			className: `${children.props.className || ''} ${className || ''}`,
			onAnimationStart: (e: React.AnimationEvent<HTMLElement>) => {
				onAnimationStart?.();
				if (children.props.onAnimationStart) children.props.onAnimationStart(e);
			},
			onAnimationEnd: (e: React.AnimationEvent<HTMLElement>) => {
				onAnimationEnd?.();
				if (children.props.onAnimationEnd) children.props.onAnimationEnd(e);
			},
		});
	}

	return (
		<div
			className={className}
			style={animationStyle}
			onAnimationStart={onAnimationStart}
			onAnimationEnd={onAnimationEnd}
		>
			{children}
		</div>
	);
};
