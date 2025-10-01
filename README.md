# Manga Tracker

A modern web application for tracking manga updates across multiple sites. The application consists of a FastAPI backend for scraping and data management, and a React frontend for user interaction.

## Features

- **Multi-site Support**: Track manga updates from multiple websites
- **Automatic Scraping**: Configurable web scraping with CSS selectors
- **Manga Management**: Add manga with aliases for better matching
- **Modern Web Interface**: Beautiful React frontend with TypeScript
- **Real-time Updates**: Manual and automatic tracking capabilities
- **PostgreSQL Database**: Robust data storage and management

## Architecture

### Backend (FastAPI)
- **API Server**: RESTful API for frontend communication
- **Web Scraping**: CloudScraper and Selenium for site scraping
- **Database**: PostgreSQL with comprehensive manga tracking schema
- **Docker Support**: Containerized deployment

### Frontend (React)
- **Modern UI**: React 18 with TypeScript and Tailwind CSS
- **Responsive Design**: Works on desktop and mobile
- **Real-time Updates**: Live status indicators and manual controls
- **Intuitive Navigation**: Clean, organized interface

## Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- PostgreSQL
- Docker (optional)

### Backend Setup

1. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Set up PostgreSQL database and configure connection in `database.py`

3. Run the FastAPI server:
   ```bash
   uvicorn main:app --reload
   ```

### Frontend Setup

1. Navigate to frontend directory:
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

### Docker Setup

```bash
docker-compose up -d
```

## Configuration

### Site Configuration Example

```json
{
    "name": "MangaPark",
    "base_url": "https://mangapark.io/",
    "latest_updates_url": "latest",
    "manga_card_selector": ".pl-3.grow.flex.flex-col.space-y-1.group",
    "title_selector": ".link-hover.link-pri",
    "chapter_selector": ".link-hover.link-primary.visited\\:link-accent",
    "navigation_mode": "pagination"
}
```

## Usage

1. **Configure Sites**: Add manga tracking sites through the web interface
2. **Add Manga**: Add manga titles and aliases to track
3. **Run Tracking**: Use the dashboard to trigger updates manually
4. **Monitor Progress**: View tracked manga and new chapters

## API Endpoints

- `GET /all-mangas` - Get all manga with details
- `POST /add-manga` - Add new manga
- `GET /sites-with-last-seen` - Get sites with tracking status
- `POST /add-site` - Add new tracking site
- `GET /track-updates` - Trigger manual tracking

## Technology Stack

### Backend
- FastAPI
- PostgreSQL
- CloudScraper
- Selenium
- BeautifulSoup

### Frontend
- React 18
- TypeScript
- Tailwind CSS
- React Router
- Axios

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.