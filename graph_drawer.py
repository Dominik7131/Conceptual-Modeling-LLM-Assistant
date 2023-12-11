import matplotlib.pyplot as plt
import networkx as nx
import json

FILE_NAME = "2023-11-27-12-16-46"

MAX_EDGE_TEXT_LENGTH = 10
ENTITY_COLOR = "red"
ATTRIBUTES_COLOR = "yellow"
EXTRA_ENTITY_IN_RELATIONSHIP_COLOR = "lime"
EDGE_COLOR = "black"

entities = {
	"entity1": {"attributes": [{"attribute": "attribute1", "description": "d1", "reason": "r1"}, {"attribute": "attribute2", "description": "d1", "reason": "r1"}],
                "relationships": [{"relationship": "r1", "description": "d1", "source": "s1", "target": "t1", "reason": "r1"}]},
	"entity2": {"attributes": [{"attribute": "attribute1", "description": "d2", "reason": "r2"}],
                "relationships": [{"relationship": "r1", "description": "d2", "source": "s2", "target": "t1", "reason": "r2"}]}
}

def main():
    file_path = f"output/{FILE_NAME}.json"
    with open(file_path) as json_file:
        entities = json.load(json_file)
    draw(entities)


def draw(entities):
    # Construct graph
    G = nx.Graph()
    node_labels = {}
    edge_simple_labels = {}
    edge_labels = {}
    index_to_node_dictionary = {}
    index_to_edge_dictionary = {}
    nodes_color_map = []
    edges_color_map = []
    nodes_count = 0
    edges_count = 0
    e_entities_list = []

    # Get all entities
    for entity in entities:
        e_entities_list.append('e_' + entity)

    for entity in entities:
        entity = 'e_' + entity

        if not G.has_node(entity):
            G.add_node(entity)     
            nodes_color_map.append(ENTITY_COLOR)
            index_to_node_dictionary[nodes_count] = entity
            nodes_count += 1

        for attribute in entities[entity[2:]]["attributes"]:

            while (G.has_node(attribute["attribute"])):
                attribute["attribute"] += '_'
            
            G.add_node(attribute["attribute"])
            node_labels[attribute["attribute"]] = attribute
            index_to_node_dictionary[nodes_count] = attribute["attribute"]
            nodes_count += 1
            nodes_color_map.append(ATTRIBUTES_COLOR)
            G.add_edge(entity, attribute["attribute"])
            edges_color_map.append(EDGE_COLOR)

            index_to_edge_dictionary[edges_count] = (entity, attribute["attribute"])
            edges_count += 1
        
        for relationship in entities[entity[2:]]["relationships"]:

            if relationship["target"] == None or relationship["source"] == None:
                continue

            # Issue: LLM sometimes creates relationship without including the given entity
            if not(relationship["source"] == entity[2:] or relationship["source"] == entity[2:]):
                #print("Warning: relationship does not contain the entity")

                source = 'e_' + relationship["source"]
                target = 'e_' + relationship["target"]

                if not G.has_node(source):
                    G.add_node(source)
                    index_to_node_dictionary[nodes_count] = source
                    nodes_count += 1
                    if source in e_entities_list:
                        nodes_color_map.append(ENTITY_COLOR)
                    else:
                        nodes_color_map.append(EXTRA_ENTITY_IN_RELATIONSHIP_COLOR)
                
                if not G.has_node(target):
                    G.add_node(target)
                    index_to_node_dictionary[nodes_count] = target
                    nodes_count += 1
                    if target in e_entities_list:
                        nodes_color_map.append(ENTITY_COLOR)
                    else:
                        nodes_color_map.append(EXTRA_ENTITY_IN_RELATIONSHIP_COLOR)
                
                if not G.has_edge(source, target) and not G.has_edge(target, source):
                    G.add_edge(source, target, color='r')
                    edges_color_map.append(EDGE_COLOR)
                    edge_simple_labels[(source, target)] = relationship["relationship"][:MAX_EDGE_TEXT_LENGTH]
                    edge_labels[(source, target)] = relationship

                    index_to_edge_dictionary[edges_count] = (source, target)
                    edges_count += 1
                continue


            target = 'e_' + relationship["target"]

            # Fix issue: LLM sometimes swaps source and target entities
            if target == entity:
                if relationship["source"] == None:
                    continue
                target = 'e_' + relationship["source"]

            if not G.has_node(target):
                G.add_node(target)
                index_to_node_dictionary[nodes_count] = target
                nodes_count += 1
                if target in e_entities_list:
                    nodes_color_map.append(ENTITY_COLOR)
                else:
                    nodes_color_map.append(EXTRA_ENTITY_IN_RELATIONSHIP_COLOR)

            G.add_edge(entity, target, color='r')
            edges_color_map.append(EDGE_COLOR)
            edge_simple_labels[(entity, target)] = relationship["relationship"][:MAX_EDGE_TEXT_LENGTH]
            edge_labels[(entity, target)] = relationship

            index_to_edge_dictionary[edges_count] = ( entity, target)
            edges_count += 1


    nx.set_node_attributes(G, node_labels)
    nx.set_edge_attributes(G, edge_labels)

    node_sizes = [500 for _ in range(len(G.nodes))]

    fig, ax = plt.subplots()

    pos = nx.spring_layout(G)

    # Check duplicate nodes
    values = list(index_to_node_dictionary.values())
    new_values = []
    new_set = set(values)

    # Find duplicate nodes
    if (len(new_set) != len(values)):
        for value in values:
            if value not in new_values:
                new_values.append(value)
            else:
                print(f"Error: Some nodes have the same name: {value}")
                exit(1)

    nodes = nx.draw_networkx_nodes(G, pos=pos, ax=ax, node_color=nodes_color_map, node_size=node_sizes)



    edges = nx.draw_networkx_edges(G, pos=pos, ax=ax)

    nx.draw_networkx_labels(G, pos=pos, ax=ax)
    nx.draw_networkx_edge_labels(G, pos=pos, ax=ax, edge_labels=edge_simple_labels, font_size=8)

    annot = ax.annotate("", xy=(0,0), xytext=(20,20),textcoords="offset points",
                        bbox=dict(boxstyle="round", fc="w"),
                        arrowprops=dict(arrowstyle="->"))
    annot.set_visible(False)


    def update_annot(ind):
        node_index = ind["ind"][0]
        node = index_to_node_dictionary[node_index]
        xy = pos[node]
        annot.xy = xy
        node_attr = {'node': node}
        node_attr.update(G.nodes[node])

        #text = '\n'.join(f'{k}: {v}' for k, v in node_attr.items())
        text = ""
        for k, v in node_attr.items():
            text += f"{k}: {v}\n"

        annot.set_text(text)
    
    def update_annot2(ind):
        edge = list(G.edges)[ind["ind"][0]]
        xy = (pos[edge[0]] + pos[edge[1]]) / 2
        annot.xy = xy
        edge_attributes = {'edge': edge}
        edge_attributes.update(G.edges[edge])

        #text = '\n'.join(f'{k}: {v}' for k, v in edge_attributes.items())
        text = ""

        for k, v in edge_attributes.items():
            if k == 'color' or k == 'edge':
                continue
            text += f"{k}: {v}\n"

        annot.set_text(text)

    def hover(event):
        is_visible = annot.get_visible()
        if event.inaxes == ax:
            # Update nodes
            cont, ind = nodes.contains(event)
            if cont:
                update_annot(ind)
                annot.set_visible(True)
                fig.canvas.draw_idle()
            else:
                if is_visible:
                    annot.set_visible(False)
                    fig.canvas.draw_idle()
            
            # Update edges
            cont, ind = edges.contains(event)
            if cont:
                update_annot2(ind)
                annot.set_visible(True)
                fig.canvas.draw_idle()
            else:
                if is_visible:
                    annot.set_visible(False)
                    fig.canvas.draw_idle()

    fig.canvas.mpl_connect("motion_notify_event", hover)

    plt.show()



if __name__ == "__main__":
    main()