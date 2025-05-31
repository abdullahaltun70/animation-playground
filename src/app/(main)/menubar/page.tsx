'use client';

import React, { useState } from 'react';

import { ChevronDownIcon } from '@radix-ui/react-icons';
import { Animate } from 'animation-library-test-abdullah-altun';

// Data for the menu items
const menuItemsData = [
  {
    title: 'Flights',
    subItems: [
      'Flight Status',
      'Flight Tracking',
      'Airlines',
      'Destinations',
      'Air Service Additions',
      'Airfare Deals',
    ],
  },
  {
    title: 'Parking & Transportation',
    subItems: ['Parking', 'Rental Cars', 'Taxis', 'Shuttles'],
  },
  {
    title: 'Shop & Dine',
    subItems: ['Restaurants', 'Shops', 'Duty-Free'],
  },
  {
    title: 'About',
    subItems: ['About MCO', 'Contact Us', 'Careers'],
  },
  {
    title: 'Our Sites',
    subItems: ['Orlando Executive Airport', 'International Drive'],
  },
];

// MenuItem Component
const MenuItem = ({
  title,
  subItems,
}: {
  title: string;
  subItems: string[];
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ position: 'relative', marginRight: '15px' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: 'none',
          border: 'none',
          color: 'white',
          padding: '10px 15px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          fontSize: '16px',
          fontFamily: 'sans-serif',
        }}
      >
        {title}
        <Animate
          type="rotate"
          degrees={isOpen ? 180 : 0}
          duration={0.3}
          easing="cubic-bezier(0.87, 0, 0.13, 1)"
          style={{
            display: 'inline-block',
            verticalAlign: 'middle',
            marginLeft: '8px',
            transformOrigin: '50% 40%',
          }} // Added styles here
        >
          <ChevronDownIcon />
        </Animate>
      </button>
      {isOpen && (
        <Animate
          type="slide"
          axis="y"
          distance={15} // Positive distance for slide-up entrance
          duration={0.25}
          delay={0.04} // Staggered animation
          opacity={{ start: 0, end: 1 }} // Fade in while sliding
          easing="cubic-bezier(0.25, 0.1, 0.25, 1)" // Smooth easing
        >
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              background: 'white',
              border: '1px solid #ccc',
              borderRadius: '4px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              padding: '10px',
              minWidth: '220px',
              zIndex: 1000, // Ensure submenu is on top
              color: '#333',
              marginTop: '5px', // Small gap between button and menu
            }}
          >
            {subItems.map((item) => (
              <>
                <div
                  style={{
                    padding: '10px 12px',
                    cursor: 'pointer',
                    borderRadius: '3px',
                    fontSize: '15px',
                    fontFamily: 'sans-serif',
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = '#f0f0f0')
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = 'none')
                  }
                >
                  {item}
                </div>
              </>
            ))}
          </div>
        </Animate>
      )}
    </div>
  );
};

// Main Test Page Component
export default function TestMenuBarPage() {
  return (
    <div style={{ fontFamily: 'sans-serif', color: '#333' }}>
      <header
        style={{
          padding: '20px',
          background: 'var(--bg)',
          borderBottom: '1px solid #eee',
        }}
      >
        <h1>Showcasing Animate Component: Menu Bar</h1>
        <p>
          This page demonstrates a menu bar built with the <code>Animate</code>{' '}
          component.
        </p>
      </header>

      <nav
        style={{
          display: 'flex',
          background: '#005A70', // Teal color similar to MCO example
          padding: '10px 30px',
          alignItems: 'center',
          minHeight: '60px',
        }}
      >
        <div
          style={{
            color: 'white',
            fontSize: '28px',
            fontWeight: 'bold',
            marginRight: '50px',
          }}
        >
          LOGO
        </div>
        {menuItemsData.map((item) => (
          <MenuItem
            key={item.title}
            title={item.title}
            subItems={item.subItems}
          />
        ))}
      </nav>

      <main
        style={{
          padding: '30px',
          minHeight: 'calc(100vh - 250px)',
          background: 'var(--bg)',
        }}
      >
        <h2>Page Content Area</h2>
        <p>This is where the rest of the page content would go.</p>
        <p>
          The menu above uses the <code>Animate</code> component for rotating
          chevrons and slide-up animations for submenu items.
        </p>
      </main>
    </div>
  );
}
