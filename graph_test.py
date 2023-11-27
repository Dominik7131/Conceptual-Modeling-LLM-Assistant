import networkx as nx
import matplotlib.pyplot as plt

entities = {
	"entity1": {"attributes": [{"attribute": "attribute1", "description": "d1", "reason": "r1"}, {"attribute": "attribute2", "description": "d1", "reason": "r1"}],
                "relationships": [{"relationship": "r1", "description": "d1", "source": "s1", "target": "t1", "reason": "r1"}]},
	"entity2": {"attributes": [{"attribute": "attribute3", "description": "d2", "reason": "r2"}],
                "relationships": [{"relationship": "r2", "description": "d2", "source": "s2", "target": "t2", "reason": "r2"}]}
}
G = nx.DiGraph()

nodes_color_map = []
edges_color_map = []


for entity in entities:
    G.add_node(entity)
    nodes_color_map.append('white')

    for attribute in entities[entity]["attributes"]:
        G.add_node(attribute["attribute"])
        nodes_color_map.append('yellow')
        G.add_edge(entity, attribute["attribute"])
        edges_color_map.append("black")
    
    for relationship in entities[entity]["relationships"]:

        if not G.has_node(relationship["target"]):
            G.add_node(relationship["target"])
            nodes_color_map.append("red")

        G.add_edge(entity, relationship["target"], color='r')
        edges_color_map.append("red")

node_sizes = [500 for _ in range(len(nodes_color_map))]

nx.draw_spring(G, node_color=nodes_color_map, edge_color=edges_color_map, with_labels=True, node_size=node_sizes)
plt.show()