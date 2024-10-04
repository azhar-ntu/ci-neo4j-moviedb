from fastapi import FastAPI, HTTPException, Query
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from py2neo import Graph, Node, Relationship, NodeMatcher
from typing import Optional, List
import logging
import requests
import re

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Allow only the Next.js frontend
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Neo4j connection setup
NEO4J_URI = "bolt://localhost:7687"  # Update this with your Neo4j URI
NEO4J_USER = "neo4j"  # Update this with your Neo4j username
NEO4J_PASSWORD = "password"  # Update this with your Neo4j password

# Connect to Neo4j
graph = Graph(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))
matcher = NodeMatcher(graph)

# TMDB API setup
TMDB_API_KEY = "535b98608031a939cdef34fb2a98ebc5"  # Replace with your TMDB API key
TMDB_BASE_URL = "https://api.themoviedb.org/3"

# Set up logging
logging.basicConfig(filename='api_log.txt', level=logging.INFO, 
                    format='%(asctime)s - %(levelname)s - %(message)s')

# Load HTML content
# Update the HTML content loading to use a function
def get_html_content():
    with open("index.html", "r") as file:
        return file.read()

@app.get("/", response_class=HTMLResponse)
async def read_root():
    return get_html_content()
    
@app.get("/autocomplete/{search_type}")
async def autocomplete(search_type: str, query: str = Query(..., min_length=1)):
    if search_type not in ['actor', 'movie']:
        raise HTTPException(status_code=400, detail="Invalid search type")
    
    cypher_query = """
    MATCH (n:{label})
    WHERE n.name =~ $regex
    RETURN n.name AS name
    LIMIT 5
    """.format(label='Actor' if search_type == 'actor' else 'Movie')
    
    regex = f"(?i).*{re.escape(query)}.*"
    results = graph.run(cypher_query, regex=regex).data()
    
    return [result['name'] for result in results]

@app.get("/", response_class=HTMLResponse)
async def read_root():
    return get_html_content()
class Actor(BaseModel):
    name: str
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    date_of_death: Optional[str] = None

class Movie(BaseModel):
    title: str
    year: str

class ActorInMovie(BaseModel):
    actor_name: str
    movie_title: str

class ActorFilmography(BaseModel):
    actor: Actor
    movies: List[Movie]

class ActorCreate(BaseModel):
    name: str
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
# Actor CRUD operations
@app.post("/actors", response_model=Actor)
async def create_actor(actor: Actor):
    try:
        actor_node = Node("Actor", **actor.dict())
        graph.create(actor_node)
        logging.info(f"Actor created: {actor.name}")
        return actor
    except Exception as e:
        logging.error(f"Error creating actor: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/actors/{name}", response_model=Actor)
async def read_actor(name: str):
    actor_node = matcher.match("Actor", name=name).first()
    if actor_node:
        return Actor(**dict(actor_node))
    raise HTTPException(status_code=404, detail="Actor not found")

@app.get("/actors", response_model=List[Actor])
async def read_actors():
    actors = matcher.match("Actor")
    return [Actor(**dict(actor)) for actor in actors]

@app.put("/actors/{name}", response_model=Actor)
async def update_actor(name: str, actor: Actor):
    actor_node = matcher.match("Actor", name=name).first()
    if actor_node:
        actor_node.update(**actor.dict())
        graph.push(actor_node)
        logging.info(f"Actor updated: {name}")
        return Actor(**dict(actor_node))
    raise HTTPException(status_code=404, detail="Actor not found")

@app.delete("/actors/{name}")
async def delete_actor(name: str):
    actor_node = matcher.match("Actor", name=name).first()
    if actor_node:
        graph.delete(actor_node)
        logging.info(f"Actor deleted: {name}")
        return {"message": f"Actor {name} deleted successfully"}
    raise HTTPException(status_code=404, detail="Actor not found")

# Movie CRUD operations
@app.post("/movies", response_model=Movie)
async def create_movie(movie: Movie):
    try:
        movie_node = Node("Movie", **movie.dict())
        graph.create(movie_node)
        logging.info(f"Movie created: {movie.title}")
        return movie
    except Exception as e:
        logging.error(f"Error creating movie: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/movies/{title}", response_model=Movie)
async def read_movie(title: str):
    movie_node = matcher.match("Movie", title=title).first()
    if movie_node:
        return Movie(**dict(movie_node))
    raise HTTPException(status_code=404, detail="Movie not found")

@app.get("/movies", response_model=List[Movie])
async def read_movies():
    movies = matcher.match("Movie")
    return [Movie(**dict(movie)) for movie in movies]

@app.put("/movies/{title}", response_model=Movie)
async def update_movie(title: str, movie: Movie):
    movie_node = matcher.match("Movie", title=title).first()
    if movie_node:
        movie_node.update(**movie.dict())
        graph.push(movie_node)
        logging.info(f"Movie updated: {title}")
        return Movie(**dict(movie_node))
    raise HTTPException(status_code=404, detail="Movie not found")

@app.delete("/movies/{title}")
async def delete_movie(title: str):
    movie_node = matcher.match("Movie", title=title).first()
    if movie_node:
        graph.delete(movie_node)
        logging.info(f"Movie deleted: {title}")
        return {"message": f"Movie {title} deleted successfully"}
    raise HTTPException(status_code=404, detail="Movie not found")

# Relationship operation
@app.post("/actor_in_movie")
async def add_actor_to_movie(relation: ActorInMovie):
    try:
        actor_node = matcher.match("Actor", name=relation.actor_name).first()
        movie_node = matcher.match("Movie", title=relation.movie_title).first()
        
        if not actor_node:
            raise HTTPException(status_code=404, detail="Actor not found")
        if not movie_node:
            raise HTTPException(status_code=404, detail="Movie not found")
        
        acted_in = Relationship(actor_node, "ACTED_IN", movie_node)
        graph.merge(acted_in)
        
        logging.info(f"Relationship added: {relation.actor_name} ACTED_IN {relation.movie_title}")
        return {"message": f"Relationship added: {relation.actor_name} ACTED_IN {relation.movie_title}"}
    except Exception as e:
        logging.error(f"Error adding relationship: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# TMDB Integration
def fetch_actor_from_tmdb(actor_name):
    search_url = f"{TMDB_BASE_URL}/search/person"
    params = {
        "api_key": TMDB_API_KEY,
        "query": actor_name
    }
    response = requests.get(search_url, params=params)
    data = response.json()

    if data["results"]:
        actor_data = data["results"][0]
        actor_id = actor_data["id"]

        # Fetch detailed actor info including movie credits
        details_url = f"{TMDB_BASE_URL}/person/{actor_id}"
        params = {
            "api_key": TMDB_API_KEY,
            "append_to_response": "movie_credits"
        }
        response = requests.get(details_url, params=params)
        actor_details = response.json()

        # Extract filmography
        filmography = []
        for movie in actor_details.get('movie_credits', {}).get('cast', []):
            if movie.get('release_date'):
                year = movie['release_date'][:4]
                filmography.append({
                    "title": movie['title'],
                    "year": year
                })

        return {
            "name": actor_details["name"],
            "date_of_birth": actor_details.get("birthday"),
            "gender": "Male" if actor_details["gender"] == 2 else "Female",
            "date_of_death": actor_details.get("deathday"),
            "filmography": filmography
        }
    return None

def add_actor_to_neo4j(actor_data):
    actor_node = Node("Actor", 
                      name=actor_data['name'],
                      date_of_birth=actor_data['date_of_birth'],
                      gender=actor_data['gender'],
                      date_of_death=actor_data['date_of_death'])
    graph.merge(actor_node, "Actor", "name")

    for movie in actor_data['filmography']:
        movie_node = Node("Movie", title=movie['title'], year=movie['year'])
        graph.merge(movie_node, "Movie", "title")
        
        acted_in = Relationship(actor_node, "ACTED_IN", movie_node)
        graph.merge(acted_in)

    logging.info(f"Actor added to Neo4j with filmography: {actor_data['name']}")
    return actor_data

@app.post("/add_actor_from_tmdb/{actor_name}")
async def add_actor_from_tmdb(actor_name: str):
    try:
        actor_data = fetch_actor_from_tmdb(actor_name)
        if actor_data:
            added_actor = add_actor_to_neo4j(actor_data)
            return {
                "message": f"Actor {actor_name} added successfully with filmography",
                "data": {
                    "name": added_actor['name'],
                    "date_of_birth": added_actor['date_of_birth'],
                    "gender": added_actor['gender'],
                    "movies_count": len(added_actor['filmography'])
                }
            }
        else:
            raise HTTPException(status_code=404, detail=f"Actor {actor_name} not found in TMDB")
    except Exception as e:
        logging.error(f"Error adding actor from TMDB: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    
@app.get("/actors/{name}/filmography", response_model=Optional[ActorFilmography])
async def get_actor_filmography(name: str):
    cypher_query = """
    MATCH (a:Actor {name: $name})-[:ACTED_IN]->(m:Movie)
    RETURN a AS actor, collect(m) AS movies
    """
    result = graph.run(cypher_query, name=name).data()
    
    if not result:
        return None
    
    actor_data = result[0]['actor']
    movies_data = result[0]['movies']
    
    return ActorFilmography(
        actor=Actor(**dict(actor_data)),
        movies=[Movie(**dict(movie)) for movie in movies_data]
    )
@app.post("/actors/add")
async def add_actor(actor: ActorCreate):
    try:
        actor_node = Node("Actor", **actor.dict())
        graph.create(actor_node)
        logging.info(f"Actor added: {actor.name}")
        return {"message": f"Actor {actor.name} added successfully"}
    except Exception as e:
        logging.error(f"Error adding actor: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/actors/{name}/filmography", response_model=Optional[ActorFilmography])
async def get_actor_filmography(name: str):
    cypher_query = """
    MATCH (a:Actor {name: $name})-[:ACTED_IN]->(m:Movie)
    RETURN a AS actor, collect(m) AS movies
    """
    result = graph.run(cypher_query, name=name).data()
    
    if not result:
        return None
    
    actor_data = result[0]['actor']
    movies_data = result[0]['movies']
    
    return ActorFilmography(
        actor=Actor(**dict(actor_data)),
        movies=[Movie(**dict(movie)) for movie in movies_data]
    )

# Search endpoints
@app.get("/search/actors", response_model=List[Actor])
async def search_actors(query: str = Query(..., min_length=1)):
    cypher_query = """
    MATCH (a:Actor)
    WHERE a.name =~ $regex
    RETURN a
    """
    regex = f"(?i).*{re.escape(query)}.*"
    results = graph.run(cypher_query, regex=regex).data()
    return [Actor(**dict(result['a'])) for result in results]

@app.get("/search/movies", response_model=List[Movie])
async def search_movies(query: str = Query(..., min_length=1)):
    cypher_query = """
    MATCH (m:Movie)
    WHERE m.title =~ $regex
    RETURN m
    """
    regex = f"(?i).*{re.escape(query)}.*"
    results = graph.run(cypher_query, regex=regex).data()
    return [Movie(**dict(result['m'])) for result in results]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
