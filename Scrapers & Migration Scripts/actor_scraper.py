import requests
import csv
import logging
import time
import json
from py2neo import Graph, Node, Relationship

# Set up logging
logging.basicConfig(filename='tmdb_scraper_log.txt', level=logging.INFO, 
                    format='%(asctime)s - %(levelname)s - %(message)s')

# TMDb API setup
TMDB_API_KEY = "5050d8fbe80ae587b7b26c894ea8ecb2"  # Replace with your actual TMDb API key
TMDB_BASE_URL = "https://api.themoviedb.org/3"

# Neo4j connection setup
NEO4J_URI = "bolt://localhost:7687"  # Update this with your Neo4j URI
NEO4J_USER = "neo4j"  # Update this with your Neo4j username
NEO4J_PASSWORD = "12345678"  # Update this with your Neo4j password

graph = Graph(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))

def get_actor_details(actor_name):
    search_url = f"{TMDB_BASE_URL}/search/person"
    params = {
        "api_key": TMDB_API_KEY,
        "query": actor_name
    }
    try:
        response = requests.get(search_url, params=params)
        response.raise_for_status()  # Raises a HTTPError if the status is 4xx, 5xx
        data = response.json()
        
        if 'results' not in data:
            logging.error(f"Unexpected API response for {actor_name}: {json.dumps(data)}")
            return None
        
        if not data['results']:
            logging.warning(f"No results found for actor: {actor_name}")
            return None
        
        actor_id = data['results'][0]['id']
        
        details_url = f"{TMDB_BASE_URL}/person/{actor_id}"
        params = {
            "api_key": TMDB_API_KEY,
            "append_to_response": "movie_credits"
        }
        response = requests.get(details_url, params=params)
        response.raise_for_status()
        actor_data = response.json()
        
        return actor_data
    except requests.RequestException as e:
        logging.error(f"API request failed for {actor_name}: {str(e)}")
        return None

def extract_actor_info(actor_data):
    name = actor_data['name']
    dob = actor_data.get('birthday', 'Unknown')
    gender = "Male" if actor_data['gender'] == 2 else "Female" if actor_data['gender'] == 1 else "Unknown"
    dod = actor_data.get('deathday', 'N/A')
    
    movies = []
    for movie in actor_data.get('movie_credits', {}).get('cast', []):
        if 'release_date' in movie and movie['release_date']:
            year = movie['release_date'][:4]
            movies.append((movie['title'], year))
    
    return name, dob, gender, dod, movies

def export_to_csv(all_actor_data, filename):
    try:
        with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
            csvwriter = csv.writer(csvfile)
            csvwriter.writerow(['Name', 'Date of Birth', 'Gender', 'Date of Death', 'Movie Title', 'Year'])
            
            for actor_data in all_actor_data:
                if actor_data:
                    name, dob, gender, dod, movies = actor_data
                    for movie in movies:
                        csvwriter.writerow([name, dob, gender, dod, movie[0], movie[1]])
        
        logging.info(f"Data successfully exported to {filename}")
        print(f"Data exported to {filename}")
    except Exception as e:
        logging.error(f"Error exporting to CSV: {str(e)}")
        print(f"Error exporting to CSV: {str(e)}")

def export_to_neo4j(all_actor_data):
    try:
        # Clear existing data (optional, remove if you want to keep existing data)
        graph.run("MATCH (n) DETACH DELETE n")

        for actor_data in all_actor_data:
            if actor_data:
                name, dob, gender, dod, movies = actor_data
                
                # Create actor node
                actor_node = Node("Actor", name=name, date_of_birth=dob, gender=gender, date_of_death=dod)
                graph.create(actor_node)
                
                for movie_title, movie_year in movies:
                    # Create movie node (if it doesn't exist)
                    movie_node = Node("Movie", title=movie_title, year=movie_year)
                    graph.merge(movie_node, "Movie", "title")
                    
                    # Create relationship between actor and movie
                    acted_in = Relationship(actor_node, "ACTED_IN", movie_node)
                    graph.create(acted_in)
        
        logging.info("Data successfully exported to Neo4j")
        print("Data exported to Neo4j")
    except Exception as e:
        logging.error(f"Error exporting to Neo4j: {str(e)}")
        print(f"Error exporting to Neo4j: {str(e)}")

def process_actors_from_file(input_file):
    all_actor_data = []
    actors_with_no_data = []
    
    try:
        with open(input_file, 'r') as file:
            actor_names = file.read().splitlines()
        
        for actor_name in actor_names:
            print(f"Processing {actor_name}...")
            actor_data = get_actor_details(actor_name.strip())
            if actor_data:
                processed_data = extract_actor_info(actor_data)
                all_actor_data.append(processed_data)
            else:
                actors_with_no_data.append(actor_name)
            time.sleep(0.25)  # TMDb API allows 40 requests per 10 seconds
        
        if actors_with_no_data:
            logging.warning(f"No data found for the following actors: {', '.join(actors_with_no_data)}")
            print(f"No data found for: {', '.join(actors_with_no_data)}")
        
        return all_actor_data
    except FileNotFoundError:
        logging.error(f"Input file {input_file} not found")
        print(f"Input file {input_file} not found. Please create this file with a list of actor names, one per line.")
        return []
    except Exception as e:
        logging.error(f"Error processing actors from file: {str(e)}")
        print(f"Error processing actors from file: {str(e)}")
        return []

# Main execution
input_file = 'actors.txt'
output_file = 'actors_movies_tmdb2.csv'

logging.info("Script started")
all_actor_data = process_actors_from_file(input_file)
if all_actor_data:
    export_to_csv(all_actor_data, output_file)
    export_to_neo4j(all_actor_data)
else:
    logging.warning("No valid actor data to export")
    print("No valid actor data to export")
logging.info("Script finished")