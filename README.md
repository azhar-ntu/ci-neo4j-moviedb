# 🎬 Movie Database Explorer 🍿 
##### *Powered by Neo4j*

## Description
A web application for exploring movie and actor relationships using Neo4j graph database. The application allows users to search for actors and movies, visualize their connections, and manage the database through a REST API.

## Features

- Interactive graph visualization of actor-movie relationships
- Actor and movie search with auto-completion
- Detailed actor filmographies and movie cast lists
- Integration with The Movie Database (TMDB) API for actor and movie data

## Installation

There are several ways to run this application, first clone the repository:

```bash
# Clone the repository
git clone https://github.com/azharntu/ci-neo4j-moviedb.git
cd ci-neo4j-moviedb
```

### 1. Using Pre-built Docker Images

The simplest way to run the application is using the pre-built Docker images:

```bash
# Pull the images
docker pull azharntu/in6299-ci-neo4j-moviedb-frontend:latest
docker pull azharntu/in6299-ci-neo4j-moviedb-backend:latest

# Run using docker-compose
docker-compose up
```

### 2. Building Docker Images Locally

If you want to build the images yourself:

```bash
# Build and run using docker-compose
docker-compose -f docker-compose.dev.yaml up --build
```

### 3. Using External Neo4j Instance

To use an external Neo4j instance (like Neo4j Desktop or AuraDB):

```bash
# Edit docker-compose.external.yaml to set your Neo4j connection details
# Then run:
docker-compose -f docker-compose.external.yaml up
```

### 4. Running Services Locally

To run the services without Docker:

#### Backend (Python/FastAPI):
```bash
# Install dependencies
cd Backend
pip install -r requirements.txt

# Set environment variables
export NEO4J_URI=bolt://localhost:7687
export NEO4J_USER=neo4j
export NEO4J_PASSWORD=password
export TMDB_API_KEY=your_tmdb_api_key
export PORT=10000

# Run the server
uvicorn main:app --host 0.0.0.0 --port 10000
```

#### Frontend (Next.js):
```bash
# Install dependencies
cd Frontend
npm install --legacy-peer-deps

# Set environment variables
echo "NEXT_PUBLIC_API_URL=http://localhost:10000" > .env.local

# Run the development server
npm run dev

# OR Compile and run
npm run build
npm run start
```

## Environment Variables

### Backend
- `NEO4J_URI`: Neo4j connection URI (default: bolt://localhost:7687)
- `NEO4J_USER`: Neo4j username (default: neo4j)
- `NEO4J_PASSWORD`: Neo4j password
- `TMDB_API_KEY`: TMDB API key for fetching movie/actor data
- `TMDB_BASE_URL`: TMDB API base URL (default: https://api.themoviedb.org/3)
- `PORT`: Backend server port (default: 10000)

### Frontend
- `NEXT_PUBLIC_API_URL`: Backend API URL (default: http://localhost:10000)
---
## API Documentation
FastAPI automatically generates API documentation at `/docs` and `/redoc` endpoints of the backend service ([localhost:10000](http://localhost:10000)).
- [API Documentation](https://ci-neo4j-moviedb-backend.onrender.com/docs)
- [API Documentation ReDoc](https://ci-neo4j-moviedb-backend.onrender.com/redoc)

### Actor Endpoints

#### Search Actors
```
GET /search/actor?query={query}
```
Search for actors by name.

#### Get Actor Details
```
GET /actors/{name}
```
Get details for a specific actor.

#### Get Actor Filmography
```
GET /actors/{name}/filmography
```
Get an actor's complete filmography.

#### Add Actor from TMDB
```
POST /add_actor_from_tmdb/{actor_name}
```
Add an actor and their filmography from TMDB.

#### Update Actor
```
PUT /actors/{name}
```
Update actor details, optionally fetching from TMDB.

### Movie Endpoints

#### Search Movies
```
GET /search/movie?query={query}
```
Search for movies by title.

#### Get Movie Cast
```
GET /movies/{title}/cast
```
Get the complete cast list for a movie.

#### Get Movie Poster
```
GET /movie/poster/{title}
```
Get movie poster information from TMDB.

### Utility Endpoints

#### Autocomplete
```
GET /autocomplete/{search_type}?query={query}
```
Get autocomplete suggestions for actors or movies.

#### Health Check
```
GET /health
```
Check the health status of the application.

#### Seed Database
```
POST /seed/actors
```
Seed the database with a predefined list of actors.

## Frontend Functionality (page.js)

The frontend application provides:

1. **Search Interface**
   - Dual-mode search for actors or movies
   - Auto-complete suggestions
   - Support for adding missing actors from TMDB

2. **Graph Visualization**
   - Interactive force-directed graph showing relationships
   - Color-coded nodes (red for actors, teal for movies)
   - Click-through navigation
   - Automatic zoom and centering

3. **Detailed Information**
   - Actor filmographies with year information
   - Movie cast lists
   - Profile images for actors
   - Movie posters

4. **Developer Features**
   - Cypher query visualization
   - Toggle for query display
   - URL-based state management
   - Responsive design

5. **Navigation**
   - View all actors
   - View all movies
   - Browser history integration