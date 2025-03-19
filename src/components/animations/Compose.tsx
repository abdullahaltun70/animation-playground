// src/components/animations/ComposeAnimations.tsx
import React, { Children, cloneElement, ReactElement } from 'react';

interface ComposeAnimationsProps {
	children: ReactElement | ReactElement[];
}

export const ComposeAnimations: React.FC<ComposeAnimationsProps> = ({
	children,
}) => {
	const childArray = Children.toArray(children) as ReactElement[];

	// Base case: no children or only one child
	if (childArray.length <= 1) {
		return <>{children}</>;
	}

	// Take the first child and merge it with the composed rest
	const firstChild = childArray[0];
	const restChildren = childArray.slice(1);

	const combineAnimations = (child: ReactElement, restProps: any) => {
		const { style: childStyle = {}, ...childProps } = child.props;

		// Combine animation styles
		const combinedStyle = {
			...childStyle,
			...restProps.style,
			animationName:
				`${childStyle.animationName || ''} ${restProps.style?.animationName || ''}`.trim(),
		};

		// Create a new element with combined props
		return cloneElement(child, {
			...childProps,
			...restProps,
			style: combinedStyle,
		});
	};

	// Recursively compose the rest of the children
	const composedRest = <ComposeAnimations>{restChildren}</ComposeAnimations>;

	// Combine the first child with the composed rest
	return combineAnimations(firstChild, composedRest.props);
};
