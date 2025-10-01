# Manga Tracker Backend

FastAPI backend for the Manga Tracker application that handles web scraping, database operations, and API endpoints.

## Features

- **FastAPI REST API** with automatic documentation
- **PostgreSQL Database** with comprehensive manga tracking schema
- **Web Scraping** using CloudScraper and Selenium
- **Multi-site Support** with configurable CSS selectors
- **CORS Enabled** for frontend integration

## Project Structure

```
backend/
├── main.py              # FastAPI application and API endpoints
├── database.py          # Database connection and operations
├── tracker.py           # Web scraping logic
├── requirements.txt     # Python dependencies
├── Dockerfile          # Docker configuration
├── wait-for-it.sh      # Database readiness script
└── README.md           # This file
```

## API Endpoints

### Manga Management
- `GET /all-mangas` - Get all manga with details
- `GET /manga-list` - Get tracked manga list
- `POST /add-manga` - Add new manga
- `DELETE /delete-manga/{id}` - Delete manga

### Site Management
- `GET /sites-with-last-seen` - Get sites with tracking status
- `POST /add-site` - Add new tracking site
- `DELETE /remove-site/{id}` - Delete site

### Tracking
- `GET /track-updates` - Trigger manual tracking

## Setup

### Prerequisites
- Python 3.8+
- PostgreSQL database
- Docker (optional)

### Local Development

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Set up PostgreSQL database and configure connection in `database.py`

3. Run the development server:
   ```bash
   python main.py
   # or
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

### Docker Development

1. From the project root:
   ```bash
   docker-compose up -d
   ```

## Configuration

### Database Connection
Configure the database connection in `database.py`:
```python
DATABASE_URL = os.getenv("DATABASE_URL", "dbname=manga_tracker user=postgres password=postgres host=localhost port=5432")
```

### CORS Settings
Configure allowed origins in `main.py`:
```python
origins = [
    "http://localhost:3000",
    "http://localhost:4200",
]
```

## Database Schema

### Tables
- **sites** - Manga tracking sites configuration
- **mangas** - Manga titles and primary names
- **manga_aliases** - Alternative manga titles
- **manga_sources** - Manga tracking sources per site
- **site_last_seen** - Last seen manga per site

### Key Features
- Automatic table creation on startup
- Foreign key constraints with cascade delete
- JSON storage for newly found chapters
- Flexible alias system for manga matching

## Web Scraping

### Supported Navigation Modes
- **Pagination** - Standard page-based navigation
- **Load More** - JavaScript-based infinite scroll

### Site Configuration
Each site requires:
- Base URL and latest updates path
- CSS selectors for manga cards, titles, and chapters
- Navigation mode configuration

## Development

### Adding New Sites
Use the API endpoint `POST /add-site` with site configuration:
```json
{
    "name": "Site Name",
    "base_url": "https://example.com/",
    "latest_updates_url": "latest",
    "manga_card_selector": ".manga-card",
    "title_selector": ".title",
    "chapter_selector": ".chapter",
    "navigation_mode": "pagination"
}
```

### Testing
- API documentation available at `http://localhost:8000/docs`
- Interactive API testing with Swagger UI

## Dependencies

- **FastAPI** - Web framework
- **PostgreSQL** - Database
- **CloudScraper** - Web scraping
- **Selenium** - JavaScript rendering
- **BeautifulSoup** - HTML parsing
- **Pydantic** - Data validation

## Environment Variables

- `DATABASE_URL` - PostgreSQL connection string
- `POSTGRES_DB` - Database name (Docker)
- `POSTGRES_USER` - Database user (Docker)
- `POSTGRES_PASSWORD` - Database password (Docker)
