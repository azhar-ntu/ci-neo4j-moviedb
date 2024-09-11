import csv
from py2neo import Graph, Node, Relationship
import logging

# Set up logging
logging.basicConfig(filename='neo4j_import_log.txt', level=logging.INFO, 
                    format='%(asctime)s - %(levelname)s - %(message)s')

# Neo4j connection setup
NEO4J_URI = "bolt://localhost:7687"  # Update this with your Neo4j URI
NEO4J_USER = "neo4j"  # Update this with your Neo4j username
NEO4J_PASSWORD = "password"  # Update this with your Neo4j password

# Connect to Neo4j
graph = Graph(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))

def import_csv_to_neo4j(csv_file):
    try:
        # Clear existing data (optional, remove if you want to keep existing data)
        graph.run("MATCH (n) DETACH DELETE n")
        
        with open(csv_file, 'r', encoding='utf-8') as file:
            csv_reader = csv.DictReader(file)
            
            for row in csv_reader:
                # Create or merge Actor node
                actor_node = Node("Actor", 
                                  name=row['Name'], 
                                  date_of_birth=row['Date of Birth'], 
                                  gender=row['Gender'],
                                  date_of_death=row['Date of Death'])
                graph.merge(actor_node, "Actor", "name")
                
                # Create or merge Movie node
                movie_node = Node("Movie", 
                                  title=row['Movie Title'], 
                                  year=row['Year'])
                graph.merge(movie_node, "Movie", "title")
                
                # Create ACTED_IN relationship
                acted_in = Relationship(actor_node, "ACTED_IN", movie_node)
                graph.merge(acted_in)
        
        logging.info("Data successfully imported to Neo4j")
        print("Data successfully imported to Neo4j")
    
    except Exception as e:
        logging.error(f"Error importing data to Neo4j: {str(e)}")
        print(f"Error importing data to Neo4j: {str(e)}")

if __name__ == "__main__":
    csv_file = 'actors_movies_tmdb.csv'  # Update this with your CSV file name
    import_csv_to_neo4j(csv_file)