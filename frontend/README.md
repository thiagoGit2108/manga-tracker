# Manga Tracker Frontend

A modern React frontend for the Manga Tracker application, built with TypeScript and Tailwind CSS.

## Features

- **Dashboard**: Overview of your manga collection with statistics and recent updates
- **Manga Management**: Add new manga with aliases and manage your collection
- **Site Management**: Configure and manage manga tracking sites
- **Real-time Updates**: Manual tracking trigger with status indicators
- **Responsive Design**: Works on desktop and mobile devices
- **Modern UI**: Clean, intuitive interface with smooth animations

## Tech Stack

- **React 18** with TypeScript
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Axios** for API communication

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend API running on port 8000

### Installation

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

The application will open in your browser at `http://localhost:3000`.

### Building for Production

```bash
npm run build
```

This creates an optimized production build in the `build` folder.

## Configuration

The frontend is configured to connect to the backend API at `http://localhost:8000` by default. You can change this by setting the `REACT_APP_API_URL` environment variable.

## Project Structure

```
frontend/
├── public/
│   ├── index.html
│   └── manifest.json
├── src/
│   ├── api/
│   │   └── client.ts          # API client configuration
│   ├── components/
│   │   └── Layout.tsx         # Main layout component
│   ├── pages/
│   │   ├── Dashboard.tsx      # Dashboard page
│   │   ├── MangaList.tsx      # Manga list page
│   │   ├── AddManga.tsx       # Add manga page
│   │   └── SiteManagement.tsx # Site management page
│   ├── types/
│   │   └── index.ts           # TypeScript type definitions
│   ├── App.tsx                # Main app component
│   ├── index.tsx              # Entry point
│   └── index.css              # Global styles
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

## Usage

### Adding Manga

1. Navigate to "Add Manga" from the main navigation
2. Enter the primary manga name
3. Optionally add aliases (alternative names used on different sites)
4. Click "Add Manga" to save

### Configuring Sites

1. Go to "Sites" in the navigation
2. Click "Add Site" to configure a new manga site
3. Fill in the required information:
   - Site name and base URL
   - Latest updates page path
   - CSS selectors for manga cards, titles, and chapters
   - Navigation mode (pagination or load more)

### Tracking Updates

1. From the Dashboard, click "Track Updates" to manually trigger a scan
2. The system will check all configured sites for new chapters
3. Updates will appear in your manga list and dashboard

## API Integration

The frontend communicates with the FastAPI backend through the following endpoints:

- `GET /all-mangas` - Get all manga with details
- `GET /manga-list` - Get tracked manga list
- `POST /add-manga` - Add new manga
- `DELETE /delete-manga/{id}` - Delete manga
- `GET /sites-with-last-seen` - Get sites with tracking status
- `POST /add-site` - Add new site
- `DELETE /remove-site/{id}` - Delete site
- `GET /track-updates` - Trigger manual tracking

## Styling

The application uses Tailwind CSS for styling with a custom color palette:

- Primary colors: Blue-based theme
- Gray scale: For text and backgrounds
- Status colors: Green (success), Red (error), Yellow (warning)

Custom components are defined in `src/index.css` for consistent styling across the application.

## Development

### Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm eject` - Eject from Create React App

### Code Style

The project follows TypeScript best practices and uses ESLint for code quality. All components are functional components with TypeScript interfaces for props and state.
