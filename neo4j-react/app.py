from flask import Flask, jsonify
from flask_cors import CORS
from py2neo import Graph

app = Flask(__name__)
CORS(app)  # Allows requests from React frontend

# Neo4j connection
NEO4J_URI = "neo4j://localhost:7687"  # Update with your Neo4j URI
NEO4J_USER = "neo4j"  # Update with your Neo4j username
NEO4J_PASSWORD = "12345678"  # Update with your Neo4j password

graph = Graph(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))


@app.route('/api/actors', methods=['GET'])
def get_actors():
    try:
        query = "MATCH (a:Actor) RETURN a LIMIT 10"
        result = graph.run(query)
        actors = [{"name": record["a"]["name"], "date_of_birth": record["a"]["date_of_birth"]} for record in result]
        return jsonify(actors)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/movies', methods=['GET'])
def get_movies():
    try:
        query = "MATCH (m:Movie) RETURN m LIMIT 10"
        result = graph.run(query)
        movies = [{"title": record["m"]["title"], "year": record["m"]["year"]} for record in result]
        return jsonify(movies)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Endpoint to get actor-movie relationships
@app.route('/api/graph', methods=['GET'])
def get_graph():
    try:
        query = """
        MATCH (a:Actor)-[r:ACTED_IN]->(m:Movie)
        RETURN a, r, m LIMIT 100
        """
        result = graph.run(query)

        nodes = []
        links = []
        actor_nodes = {}
        movie_nodes = {}

        # Prepare nodes and links
        for record in result:
            actor = record["a"]
            movie = record["m"]

            if actor.identity not in actor_nodes:
                actor_nodes[actor.identity] = {
                    "id": actor.identity,
                    "label": actor["name"],
                    "group": "Actor"
                }
                nodes.append(actor_nodes[actor.identity])

            if movie.identity not in movie_nodes:
                movie_nodes[movie.identity] = {
                    "id": movie.identity,
                    "label": movie["title"],
                    "group": "Movie"
                }
                nodes.append(movie_nodes[movie.identity])

            links.append({
                "source": actor.identity,
                "target": movie.identity,
                "type": "ACTED_IN"
            })

        return jsonify({"nodes": nodes, "links": links})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True)