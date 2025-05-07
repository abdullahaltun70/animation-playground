// component to illustrate its client-side nature.">


import AnimatedPostItem from '@/components/animated-post-item';

// Interface voor de mock data
interface Post {
  userId: number;
  id: number;
  title: string;
  body: string;
}

// Functie om mock data op te halen
async function getMockPosts(): Promise<Post[]> {
  try {
    // We halen slechts 5 posts voor dit voorbeeld
    const response = await fetch(
      'https://jsonplaceholder.typicode.com/posts?_limit=5'
    );
    if (!response.ok) {
      throw new Error('Failed to fetch posts');
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching mock posts:', error);
    return []; // Geef een lege array terug bij een fout
  }
}

// Dit is de Server Component pagina
export default async function ServerComponentTestPage() {
  const posts = await getMockPosts();

  return (
    <div style={{ padding: '20px' }}>
      <h1>
        Server Component Test met <code>&lt;Animate /&gt;</code> (Correcte Aanpak)
      </h1>
      <p>
        Deze pagina is een Server Component. We halen data op de server op en geven
        deze vervolgens door aan een <strong>Client Component</strong> (`AnimatedPostItem`)
        die de <code>&lt;Animate /&gt;</code> component gebruikt voor de animaties.
      </p>
      <p>
        <strong>Verwachte uitkomst:</strong> De posts worden nu correct geanimeerd
        omdat de <code>&lt;Animate /&gt;</code> component binnen een Client Component
        wordt uitgevoerd.
      </p>

      <h2>Mock Posts (Geanimeerd via Client Component):</h2>
      {posts.length > 0 ? (
        posts.map((post, index) => (
          // Gebruik de AnimatedPostItem Client Component
          <AnimatedPostItem
            key={post.id}
            post={post}
            animationDelay={index * 0.2}
          />
        ))
      ) : (
        <p>Geen posts opgehaald of er is een fout opgetreden.</p>
      )}

      <hr style={{ margin: '30px 0' }} />

      <h2>Uitleg</h2>
      <p>
        De <code>&lt;Animate /&gt;</code> component van{' '}
        <code>animation-library-test-abdullah-altun</code>
        is ontworpen voor Client Components omdat het React hooks (
        <code>useEffect</code>, <code>useRef</code>, <code>useState</code>) gebruikt voor zijn
        functionaliteit. Server Components ondersteunen deze hooks niet.
      </p>
      <p>
        Door de data (<code>posts</code>) die in de Server Component is opgehaald,
        door te geven aan een specifieke Client Component (`AnimatedPostItem`),
        kan de animatielogica correct worden uitgevoerd in de browser.
        De `AnimatedPostItem` component is gemarkeerd met <code>'use client';</code>,
        waardoor het gebruik van hooks binnen die component (en dus binnen de
        geneste <code>&lt;Animate /&gt;</code>) is toegestaan.
      </p>
      <p>
        De Client Component <code>AnimatedPostItem</code> ziet er zo uit (zorg ervoor dat deze bestaat, bijvoorbeeld in <code>src/components/animated-post-item.tsx</code>):
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
'use client'; // Markeer als Client Component

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
