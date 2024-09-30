from flask import Flask, request, jsonify
from py2neo import Graph, Node, Relationship

app = Flask(__name__)

# Neo4j connection setup
NEO4J_URI = "bolt://localhost:7687"  # Update this with your Neo4j URI
NEO4J_USER = "neo4j"  # Update this with your Neo4j username
NEO4J_PASSWORD = "12345678"  # Update this with your Neo4j password

# Connect to Neo4j
graph = Graph(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))


@app.route('/actor', methods=['POST'])
def create_actor():
    data = request.json
    actor_node = Node("Actor",
                      name=data['name'],
                      date_of_birth=data.get('date_of_birth'),
                      gender=data.get('gender'),
                      date_of_death=data.get('date_of_death'))
    graph.merge(actor_node, "Actor", "name")
    return jsonify({"message": f"Actor {data['name']} created successfully"}), 201

@app.route('/actor/<name>', methods=['GET'])
def get_actor(name):
    actor_node = graph.nodes.match("Actor", name=name).first()
    if actor_node:
        return jsonify(dict(actor_node)), 200
    else:
        return jsonify({"message": f"Actor {name} not found"}), 404

@app.route('/actor/<name>', methods=['PUT'])
def update_actor(name):
    data = request.json
    actor_node = graph.nodes.match("Actor", name=name).first()
    if actor_node:
        for key, value in data.items():
            actor_node[key] = value
        graph.push(actor_node)
        return jsonify({"message": f"Actor {name} updated successfully"}), 200
    else:
        return jsonify({"message": f"Actor {name} not found"}), 404

@app.route('/actor/<name>', methods=['DELETE'])
def delete_actor(name):
    actor_node = graph.nodes.match("Actor", name=name).first()
    if actor_node:
        graph.delete(actor_node)
        return jsonify({"message": f"Actor {name} deleted successfully"}), 200
    else:
        return jsonify({"message": f"Actor {name} not found"}), 404

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
