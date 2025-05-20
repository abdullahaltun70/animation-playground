import AnimatedPostItem from '@/components/animated-post-item';

// Interface for the mock post data
interface Post {
  userId: number;
  id: number;
  title: string;
  body: string;
}

// Function to fetch mock posts
async function getMockPosts(): Promise<Post[]> {
  try {
    // Fetching only 5 posts for this example
    const response = await fetch(
      'https://jsonplaceholder.typicode.com/posts?_limit=5'
    );
    if (!response.ok) {
      throw new Error('Failed to fetch posts');
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching mock posts:', error);
    return []; // Return an empty array in case of an error
  }
}

// This is the Server Component page
export default async function ServerComponentTestPage() {
  const posts = await getMockPosts();

  return (
    <div style={{ padding: '20px' }}>
      <h1>
        Server Component Test with <code>&lt;Animate /&gt;</code> (Correct
        Approach)
      </h1>
      <p>
        This page is a Server Component. We fetch data on the server and then
        pass it to a <strong>Client Component</strong> (`AnimatedPostItem`)
        which uses the <code>&lt;Animate /&gt;</code> component for animations.
      </p>
      <p>
        <strong>Expected outcome:</strong> The posts will now be correctly
        animated because the <code>&lt;Animate /&gt;</code> component is
        executed within a Client Component.
      </p>

      <h2>Mock Posts (Animated via Client Component):</h2>
      {posts.length > 0 ? (
        posts.map((post, index) => (
          // Use the AnimatedPostItem Client Component
          <AnimatedPostItem
            key={post.id}
            post={post}
            animationDelay={index * 0.2} // Stagger animation for each post
          />
        ))
      ) : (
        <p>No posts fetched or an error occurred.</p>
      )}

      <hr style={{ margin: '30px 0' }} />

      <h2>Explanation</h2>
      <p>
        The <code>&lt;Animate /&gt;</code> component from{' '}
        <code>animation-library-test-abdullah-altun</code>
        is designed for Client Components because it uses React hooks (
        <code>useEffect</code>, <code>useRef</code>, <code>useState</code>) for
        its functionality. Server Components do not support these hooks.
      </p>
      <p>
        By passing the data (<code>posts</code>) fetched in the Server Component
        to a specific Client Component (`AnimatedPostItem`), the animation logic
        can be correctly executed in the browser. The `AnimatedPostItem`
        component is marked with <code>&apos;use client&apos;;</code>, which
        allows the use of hooks within that component (and thus within the
        nested <code>&lt;Animate /&gt;</code>).
      </p>
      <p>
        The Client Component <code>AnimatedPostItem</code> looks like this
        (ensure it exists, for example, in{' '}
        <code>src/components/animated-post-item.tsx</code>):
      </p>
      <pre
        style={{
          backgroundColor: '#eee',
          padding: '10px',
          borderRadius: '5px',
          overflowX: 'auto',
        }}
      >
        {`
// src/components/animated-post-item.tsx
'use client'; // Mark as Client Component

import { Animate } from 'animation-library-test-abdullah-altun';

interface PostData {
  id: number;
  title: string;
  body: string;
}

interface AnimatedPostItemProps {
  post: PostData;
  animationDelay?: number;
}

export default function AnimatedPostItem({ post, animationDelay = 0 }: AnimatedPostItemProps) {
  return (
    <Animate
      type="fade"
      delay={animationDelay}
      duration={0.5}
    >
      <div style={{ border: '1px solid #ccc', margin: '10px 0', padding: '15px', borderRadius: '5px', backgroundColor: '#f9f9f9' }}>
        <h3>{post.title}</h3>
        <p>{post.body}</p>
      </div>
    </Animate>
  );
}
        `}
      </pre>
    </div>
  );
}
