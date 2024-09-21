# Movie Database API

This API provides endpoints to manage a movie database, including actors and movies, using Neo4j as the backend database and integrating with The Movie Database (TMDB) for fetching actor information.

## Prerequisites

Before you begin, ensure you have the following installed:
- Python 3.7+
- Neo4j Database
- TMDB API Key

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

4. Open the `main.py` file and update the following variables with your actual values:
   - `NEO4J_URI`
   - `NEO4J_USER`
   - `NEO4J_PASSWORD`
   - `TMDB_API_KEY`

## Running the API

1. Start the FastAPI server:
   ```
   uvicorn main:app --reload
   ```

2. The API will be available at `http://localhost:8000`.

3. You can access the automatic API documentation at:
   - Swagger UI: `http://localhost:8000/docs`
   - ReDoc: `http://localhost:8000/redoc`

## API Endpoints

### Actors

- `POST /actors`: Create a new actor
- `GET /actors/{name}`: Retrieve information about a specific actor
- `GET /actors`: Retrieve a list of all actors
- `PUT /actors/{name}`: Update information for a specific actor
- `DELETE /actors/{name}`: Delete a specific actor

### Movies

- `POST /movies`: Create a new movie
- `GET /movies/{title}`: Retrieve information about a specific movie
- `GET /movies`: Retrieve a list of all movies
- `PUT /movies/{title}`: Update information for a specific movie
- `DELETE /movies/{title}`: Delete a specific movie

### Relationships

- `POST /actor_in_movie`: Create a relationship between an actor and a movie

### TMDB Integration

- `POST /add_actor_from_tmdb/{actor_name}`: Fetch actor data from TMDB and add it to the database

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

## Error Handling

The API uses standard HTTP status codes to indicate the success or failure of requests. In case of errors, a JSON response will be returned with an error message.

## Logging

The API logs important events to a file named `api_log.txt`. Check this file for debugging information and to monitor API activity.

## Security Considerations

- This API doesn't include authentication. In a production environment, you should implement proper authentication and authorization.
- Be cautious with the TMDB API key. Don't expose it in client-side code or public repositories.
- Consider implementing rate limiting to prevent abuse of the API, especially for endpoints that interact with external services like TMDB.

## Contributing

Feel free to fork this project and submit pull requests with any enhancements.

## License

[Specify your license here]