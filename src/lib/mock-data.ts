export type Article = {
  slug: string;
  title: string;
  author: string;
  authorEmail: string;
  createdAt: string;
  tags: string[];
  content: string;
  image: string;
  imageHint: string;
};

export const articles: Article[] = [
  {
    slug: "the-vortex-coaster",
    title: "The Vortex Coaster: A Deep Dive",
    author: "Jane Doe",
    authorEmail: "editor@test.com",
    createdAt: "2024-05-15",
    tags: ["coaster", "thrill-ride", "engineering"],
    content: `The Vortex Coaster is a marvel of modern engineering, pushing the boundaries of what's possible in a thrill ride.
    
### Design Philosophy
Designed by the legendary engineer Dr. Aris Thorne, the Vortex was conceived to simulate a journey through a wormhole. The track features a record-breaking 7 inversions, including a zero-g stall and a double-helix corkscrew finale.

### Key Features
- **Top Speed:** 85 mph (137 km/h)
- **Max Height:** 210 ft (64 m)
- **Ride Duration:** 2 minutes, 45 seconds
- **Unique Element:** The "Chrono-Inversion," a slow-motion heartline roll that provides a feeling of weightlessness.`,
    image: "https://picsum.photos/seed/article1/400/300",
    imageHint: "futuristic ride",
  },
  {
    slug: "safety-protocols-2024",
    title: "Updated Safety Protocols for 2024",
    author: "John Smith",
    authorEmail: "admin@test.com",
    createdAt: "2024-05-10",
    tags: ["safety", "guidelines", "operations"],
    content: `Safety is our top priority at Face Ride Entertainment. This document outlines the updated safety protocols for the 2024 season, ensuring a secure and enjoyable experience for all our guests.

### Daily Inspections
All attractions undergo a rigorous multi-point inspection every morning before the park opens. This includes:
1.  **Structural Integrity Check:** Bolts, supports, and foundations.
2.  **Vehicle & Restraint System Test:** Lap bars, harnesses, and seatbelts are tested for full functionality.
3.  **Control System Verification:** All sensors, brakes, and emergency stops are confirmed to be operational.

### Staff Training
All ride operators complete over 40 hours of hands-on training for their specific attraction, including standard operation, guest assistance, and emergency procedures.`,
    image: "https://picsum.photos/seed/article2/400/300",
    imageHint: "safety inspection",
  },
  {
    slug: "splash-mountain-history",
    title: "A Brief History of Splash Mountain",
    author: "Emily White",
    authorEmail: "editor@test.com",
    createdAt: "2024-04-22",
    tags: ["water-ride", "history", "classic"],
    content: `Splash Mountain has been a beloved attraction for decades, known for its charming story and thrilling final drop.
    
### Inception and Opening
Originally conceived in the early 1980s, Splash Mountain opened to the public in the summer of 1989. The ride's narrative and characters are based on the animated sequences from the controversial 1946 film "Song of the South."

### The Final Plunge
The ride's climax is the iconic 5-story, 40-degree drop into the briar patch, reaching speeds of over 40 mph and creating a massive splash that soaks both riders and onlookers. It remains one of the most photographed moments in theme park history.`,
    image: "https://picsum.photos/seed/article3/400/300",
    imageHint: "water ride",
  },
];
