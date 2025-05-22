'use client'; // Essential: Marks this as a Client Component.

import { Animate } from 'animation-library-test-abdullah-altun';

/**
 * @interface PostData
 * @description Defines the structure for a post object.
 * @property {number} id - The unique identifier for the post.
 * @property {string} title - The title of the post.
 * @property {string} body - The main content of the post.
 */
interface PostData {
  id: number;
  title: string;
  body: string;
}

/**
 * @interface AnimatedPostItemProps
 * @description Defines the props for the AnimatedPostItem component.
 * @property {PostData} post - The post data to display.
 * @property {number} [animationDelay=0] - Optional delay for the animation in seconds.
 */
interface AnimatedPostItemProps {
  post: PostData;
  animationDelay?: number;
}

/**
 * @component AnimatedPostItem
 * @description A client component that displays a single post item with an animation.
 * It utilizes the `<Animate>` component from `animation-library-test-abdullah-altun`
 * to apply effects like fading in.
 * @param {AnimatedPostItemProps} props - The props for the component.
 * @param {PostData} props.post - The post data object to render.
 * @param {number} [props.animationDelay=0] - Optional delay for the animation effect.
 */
export default function AnimatedPostItem({
  post,
  animationDelay = 0,
}: AnimatedPostItemProps) {
  return (
    <Animate
      type="fade" // Example animation type; can be configured as needed.
      duration={0.5}
      delay={animationDelay}
    >
      <div
        style={{
          border: '1px solid #ccc',
          margin: '10px 0',
          padding: '15px',
          borderRadius: '5px',
          backgroundColor: '#f9f9f9',
        }}
      >
        <h3>{post.title}</h3>
        <p>{post.body}</p>
      </div>
    </Animate>
  );
}
