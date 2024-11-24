# Movie Database API

This API provides endpoints to manage a movie database, including actors and movies, using Neo4j as the backend database and integrating with The Movie Database (TMDB) for fetching actor information.

## Prerequisites

Before you begin, ensure you have the following installed:
- Python 3.8+
- Nodejs 18
- Neo4j Database
- TMDB API Key
- Docker Desktop

## Setup

1. Clone the repository or download the `main.py` file.

2. Create a virtual environment (optional but recommended):
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
   ```

3. Install the required packages:
   ```
   pip install fastapi uvicorn py2neo requests
   ```
   
4. Step up neo4j database in your local: 
   1. pull the lastest neo4j
   ```
   docker pull neo4j:latest
   ```
5. Run below command in your terminal
   ```
   docker run \
   --name neo4j-container \
   -p 7474:7474 -p 7687:7687 \
   -e NEO4J_AUTH=neo4j/testpassword \
   -d neo4j:latest
   ```

6. Open the `main.py` file and update the following variables with your actual values:
   - `NEO4J_URI`
   - `NEO4J_USER`
   - `NEO4J_PASSWORD`
   - `TMDB_API_KEY`

## Running the API

1. Go to ./Backend folder
   ``` 
    cd .\Backend\
   ```

2. Start the FastAPI server:
   ```
   uvicorn main:app --host 0.0.0.0 --port 10000
   ```

3. The API will be available at `http://localhost:10000`.

4. You can access the automatic API documentation at:
   - Swagger UI: `http://localhost:10000/docs`
   - ReDoc: `http://localhost:10000/redoc`

## Running the Web Application

1. Go to ./Frontend folder
   ``` 
    cd .\Frontend\
   ```

2. Install necessary dependency, run npm command:
   ```
   npm install
   ```
   if the node version is higher than v19.0, need to run below command
   ```
    npm install --legacy-peer-deps
   ```
   
3. Run build 
   ```
   npm build
   ```

4. Run the application
   ```
   npm start
   ```

## API Endpoints

### Actors

- `POST /actors`: Create a new actor
- `GET /actors/{name}`: Retrieve information about a specific actor
- `GET /actors`: Retrieve a list of all actors
- `PUT /actors/{name}`: Update information for a specific actor
- `DELETE /actors/{name}`: Delete a specific actor
- `GET /search/actors`: Search for actors by name
- `GET /actors/{name}/filmography`: Retrieve the filmography of a specific actor

### Movies

- `POST /movies`: Create a new movie
- `GET /movies/{title}`: Retrieve information about a specific movie
- `GET /movies`: Retrieve a list of all movies
- `PUT /movies/{title}`: Update information for a specific movie
- `DELETE /movies/{title}`: Delete a specific movie
- `GET /search/movies`: Search for movies by title

### Relationships

- `POST /actor_in_movie`: Create a relationship between an actor and a movie

### TMDB Integration

- `POST /add_actor_from_tmdb/{actor_name}`: Fetch actor data from TMDB, including their filmography, and add it to the database

## Usage Examples

Here are some example curl commands to interact with the API:

1. Create an actor:
   ```
   curl -X 'POST' \
     'http://localhost:8000/actors' \
     -H 'accept: application/json' \
     -H 'Content-Type: application/json' \
     -d '{"name": "Tom Hanks", "date_of_birth": "1956-07-09", "gender": "Male"}'
   ```

2. Get all movies:
   ```
   curl -X 'GET' \
     'http://localhost:8000/movies' \
     -H 'accept: application/json'
   ```

3. Add an actor from TMDB:
   ```
   curl -X 'POST' \
     'http://localhost:8000/add_actor_from_tmdb/Brad%20Pitt' \
     -H 'accept: application/json'
   ```

4. Search for actors:
   ```
   curl -X 'GET' \
     'http://localhost:8000/search/actors?query=Tom' \
     -H 'accept: application/json'
   ```

5. Search for movies:
   ```
   curl -X 'GET' \
     'http://localhost:8000/search/movies?query=Forrest' \
     -H 'accept: application/json'
   ```

6. Get an actor's filmography:
   ```
   curl -X 'GET' \
     'http://localhost:8000/actors/Brad%20Pitt/filmography' \
     -H 'accept: application/json'
   ```

## API Behavior

When adding an actor from TMDB using the `/add_actor_from_tmdb/{actor_name}` endpoint:

1. The API fetches the actor's basic information (name, date of birth, gender, date of death) from TMDB.
2. It also retrieves the actor's filmography (movies they've acted in) from TMDB.
3. The actor's information is added to the Neo4j database as an Actor node.
4. Each movie in the actor's filmography is added as a Movie node (if it doesn't already exist).
5. Relationships (ACTED_IN) are created between the Actor node and each Movie node.

This allows you to quickly populate your database with an actor and their complete filmography in a single API call.

When retrieving an actor's filmography using the `/actors/{name}/filmography` endpoint:

1. The API searches for the actor in the Neo4j database.
2. If found, it retrieves all the movies the actor has acted in (connected by the ACTED_IN relationship).
3. The response includes the actor's information and a list of their movies.
4. If the actor is not found or has no movies, a 404 error is returned.

This endpoint allows you to quickly retrieve an actor's complete filmography as stored in your Neo4j database, without needing to make additional API calls to TMDB.

## Error Handling

The API uses standard HTTP status codes to indicate the success or failure of requests. In case of errors, a JSON response will be returned with an error message.

## Logging

The API logs important events to a file named `api_log.txt`. Check this file for debugging information and to monitor API activity.