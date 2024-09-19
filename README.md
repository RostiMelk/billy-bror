![Billy Bror Banner](/public/billy-bror-banner.png)

# Billy Bror

Billy Bror is a web application designed to track and manage dog walks, specifically for a dog named Billy. It provides features for logging walks, monitoring activity, and viewing statistics.

## Features

- Start and stop dog walks
- Real-time timer for active walks
- Manual entry of walks
- View all past trips
- Comprehensive statistics dashboard
- PWA support for mobile use

## Main Components

### Home Page (`/src/app/(app)/(authed)/page.tsx`)

The home page serves as the main interface for the app. It includes:

- A start/stop button for walks
- An active timer when a walk is in progress
- A list of recent trips
- Quick access to manually add entries and view statistics

### Statistics Page (`/src/app/(app)/(public)/stats/page.tsx`)

The statistics page provides detailed insights into Billy's walking habits:

- Top walkers of the week
- Weekly statistics (total trips, average trips per day, etc.)
- Charts showing pee and poop frequency over time
- Daily trip count for the last 7 days

## Technology Stack

- Next.js: React framework for server-side rendering and routing
- shadcn: UI component library for consistent and customizable design
- Tailwind CSS: Utility-first CSS framework for styling
- Sanity: Headless CMS for flexible and structured content management

## Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Configure Sanity:
   - Set up a Sanity project and obtain API credentials
   - Update the Sanity configuration in the project
4. Run the development server: `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000) in your browser
