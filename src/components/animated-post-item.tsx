// component, allowing animations for data originating from Server Components.">
'use client'; // Essentieel: markeer dit als een Client Component

import { Animate } from 'animation-library-test-abdullah-altun';

// Interface voor de post data die we verwachten
interface PostData {
  id: number;
  title: string;
  body: string;
}

interface AnimatedPostItemProps {
  post: PostData;
  animationDelay?: number; // Optionele prop voor animatievertraging
}

export default function AnimatedPostItem({
  post,
  animationDelay = 0,
}: AnimatedPostItemProps) {
  return (
    <Animate
      type="fade" // Je kunt hier elk gewenst animatietype en props gebruiken
      duration={0.5}
      delay={animationDelay}
    >
      {/* Dit is de content die geanimeerd wordt */}
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
