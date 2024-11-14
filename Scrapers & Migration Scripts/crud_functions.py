from py2neo import Graph, Node, Relationship
import logging

# Assuming graph is already connected
graph = Graph("bolt://localhost:7687", auth=("neo4j", "password"))  # Replace with your connection details

# Create Function: Insert new Actor or Movie nodes
def create_actor(name, date_of_birth=None, gender=None, date_of_death=None):
    try:
        actor_node = Node("Actor",
                          name=name,
                          date_of_birth=date_of_birth,
                          gender=gender,
                          date_of_death=date_of_death)
        graph.merge(actor_node, "Actor", "name")
        logging.info(f"Actor {name} created successfully.")
        print(f"Actor {name} created successfully.")
    except Exception as e:
        logging.error(f"Error creating actor {name}: {str(e)}")
        print(f"Error creating actor {name}: {str(e)}")

def create_movie(title, year=None):
    try:
        movie_node = Node("Movie",
                          title=title,
                          year=year)
        graph.merge(movie_node, "Movie", "title")
        logging.info(f"Movie {title} created successfully.")
        print(f"Movie {title} created successfully.")
    except Exception as e:
        logging.error(f"Error creating movie {title}: {str(e)}")
        print(f"Error creating movie {title}: {str(e)}")

# Read Function: Retrieve Actor or Movie nodes based on specific criteria
def get_actor_by_name(name):
    try:
        actor_node = graph.nodes.match("Actor", name=name).first()
        if actor_node:
            logging.info(f"Actor {name} found: {actor_node}.")
            print(f"Actor {name} found: {actor_node}.")
            return actor_node
        else:
            print(f"Actor {name} not found.")
            return None
    except Exception as e:
        logging.error(f"Error retrieving actor {name}: {str(e)}")
        print(f"Error retrieving actor {name}: {str(e)}")

def get_movie_by_title(title):
    try:
        movie_node = graph.nodes.match("Movie", title=title).first()
        if movie_node:
            logging.info(f"Movie {title} found: {movie_node}.")
            print(f"Movie {title} found: {movie_node}.")
            return movie_node
        else:
            print(f"Movie {title} not found.")
            return None
    except Exception as e:
        logging.error(f"Error retrieving movie {title}: {str(e)}")
        print(f"Error retrieving movie {title}: {str(e)}")

# Update Function: Update properties of Actor or Movie nodes
def update_actor(name, properties):
    try:
        actor_node = graph.nodes.match("Actor", name=name).first()
        if actor_node:
            for key, value in properties.items():
                actor_node[key] = value
            graph.push(actor_node)
            logging.info(f"Actor {name} updated successfully.")
            print(f"Actor {name} updated successfully.")
        else:
            print(f"Actor {name} not found.")
    except Exception as e:
        logging.error(f"Error updating actor {name}: {str(e)}")
        print(f"Error updating actor {name}: {str(e)}")

def update_movie(title, properties):
    try:
        movie_node = graph.nodes.match("Movie", title=title).first()
        if movie_node:
            for key, value in properties.items():
                movie_node[key] = value
            graph.push(movie_node)
            logging.info(f"Movie {title} updated successfully.")
            print(f"Movie {title} updated successfully.")
        else:
            print(f"Movie {title} not found.")
    except Exception as e:
        logging.error(f"Error updating movie {title}: {str(e)}")
        print(f"Error updating movie {title}: {str(e)}")

# Delete Function: Delete Actor or Movie nodes
def delete_actor(name):
    try:
        actor_node = graph.nodes.match("Actor", name=name).first()
        if actor_node:
            graph.delete(actor_node)
            logging.info(f"Actor {name} deleted successfully.")
            print(f"Actor {name} deleted successfully.")
        else:
            print(f"Actor {name} not found.")
    except Exception as e:
        logging.error(f"Error deleting actor {name}: {str(e)}")
        print(f"Error deleting actor {name}: {str(e)}")

def delete_movie(title):
    try:
        movie_node = graph.nodes.match("Movie", title=title).first()
        if movie_node:
            graph.delete(movie_node)
            logging.info(f"Movie {title} deleted successfully.")
            print(f"Movie {title} deleted successfully.")
        else:
            print(f"Movie {title} not found.")
    except Exception as e:
        logging.error(f"Error deleting movie {title}: {str(e)}")
        print(f"Error deleting movie {title}: {str(e)}")

# Relationship Function: Create an ACTED_IN relationship between an Actor and a Movie
def create_acted_in_relationship(actor_name, movie_title):
    try:
        actor_node = get_actor_by_name(actor_name)
        movie_node = get_movie_by_title(movie_title)

        if actor_node and movie_node:
            acted_in = Relationship(actor_node, "ACTED_IN", movie_node)
            graph.merge(acted_in)
            logging.info(f"Relationship 'ACTED_IN' created between {actor_name} and {movie_title}.")
            print(f"Relationship 'ACTED_IN' created between {actor_name} and {movie_title}.")
        else:
            print(f"Could not create relationship: Actor or Movie not found.")
    except Exception as e:
        logging.error(f"Error creating 'ACTED_IN' relationship: {str(e)}")
        print(f"Error creating 'ACTED_IN' relationship: {str(e)}")

# Example Usage
create_actor("Tom Hanks", date_of_birth="1956-07-09", gender="Male")
create_movie("Forrest Gump", year="1994")
create_acted_in_relationship("Tom Hanks", "Forrest Gump")
