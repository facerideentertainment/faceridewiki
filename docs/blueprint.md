# **App Name**: Face Ride Entertainment Wiki

## Core Features:

- User Authentication: Secure user sign-up and sign-in using Firebase Authentication, with viewer, editor, and admin roles defined.
- Wiki Entry Creation and Editing: Allow authenticated editors and admins to create new wiki entries with title, content (Markdown), and optional tags.
- AI Content Generation: An 'AI Assist' tool generates well-structured articles based on a topic.
- AI Content Enhancement: The 'AI Assist' tool improves the existing text based on user input.
- Admin Dashboard: A dedicated admin route that displays key metrics, manages pages, and provides quick actions (view, edit, delete).
- Search Functionality: A search bar to query pages by title, content text, and tags, displaying ranked results.
- Theme Implementation: Dark (default) and light themes support, configured in tailwind.config.ts to use CSS variables for color consistency.
- Storage Management: Storage is handled via Firestore pages collection to store wiki entries and the Firebase storage for image uploads related to wiki entries.

## Style Guidelines:

- Primary background color: Light beige (#FEFAF2) for the light theme and dark gray (#1C1C1C) for the dark theme, providing a subtle contrast.
- Secondary background color: White (#FFFFFF) in light theme, dark gray (#2A2A2A) in dark theme. This serves to provide distinction in each element.
- Primary accent color: Bright, saturated blue (#60A5FA) in dark theme, darker blue (#3B82F6) in light theme.
- Body font: 'Inter', sans-serif, for body text, chosen for its modern, neutral, and readable qualities.
- Headline font: 'Space Grotesk', sans-serif, for headlines, adding a techy and scientific touch.
- Icons: Exclusively from the Lucide React library.
- Layout: Responsive with a fixed header, collapsible left sidebar, and main content area.
- Animations: Subtle page transitions and UI element animations using Framer Motion.