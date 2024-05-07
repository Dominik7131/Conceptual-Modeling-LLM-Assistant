import os
import csv
from text_utility import UserChoice
  

DIRECTORY_PATH = os.path.join("out", "actual")
domain_models_name = ["aircraft-manufacturing", "conference-papers", "farming", "college", "zoological-gardens", "registry-of-road-vehicles"]
DOMAIN_DESCRIPTIONS_COUNT = [3, 3, 3, 1, 1, 1]

SEPARATOR = ','

def process_entities(path):

    entities = []

    with open(path, "r", newline="") as file:
        reader = csv.reader(file, delimiter=SEPARATOR)
        for index, row in enumerate(reader):
            if index == 0:
                continue

            entity = row[0]
            entities.append(f'"{entity}"')

    return entities


def process_attributes(path):

    attributes = []

    with open(path, "r", newline="") as file:
        reader = csv.reader(file, delimiter=SEPARATOR)
        for index, row in enumerate(reader):
            if index == 0 or len(row) == 0:
                continue

            attribute_name = row[0]
            source_entity = row[1]
            attributes.append((attribute_name, f'"{source_entity}"'))

    return attributes


def process_relationships(path):

    relationships = []

    with open(path, "r", newline="") as file:
        reader = csv.reader(file, delimiter=SEPARATOR)
        for index, row in enumerate(reader):
            if index == 0 or len(row) == 0:
                continue

            relationship_name = row[0]
            source_entity = row[2]
            target_entity = row[3]
            relationships.append((relationship_name, f'"{source_entity}"', f'"{target_entity}"'))

    return relationships


def main():
    
    for index, model_name in enumerate(domain_models_name):
        for i in range(DOMAIN_DESCRIPTIONS_COUNT[index]):

            entities_path = os.path.join(DIRECTORY_PATH, f"{model_name}-{UserChoice.ENTITIES.value}-actual-0{i + 1}.csv")
            attributes_path = os.path.join(DIRECTORY_PATH, f"{model_name}-{UserChoice.ATTRIBUTES.value}-actual-0{i + 1}.csv")
            relationships_path = os.path.join(DIRECTORY_PATH, f"{model_name}-{UserChoice.RELATIONSHIPS.value}-actual-0{i + 1}.csv")

            if not os.path.isfile(entities_path):
                raise ValueError(f"Entities file not found: {entities_path}")
            
            if not os.path.isfile(attributes_path):
                raise ValueError(f"Attributes file not found: {attributes_path}")

            if not os.path.isfile(relationships_path):
                raise ValueError(f"Relationships file not found: {relationships_path}")
            
            entities = process_entities(entities_path)
            attributes = process_attributes(attributes_path)
            relationships = process_relationships(relationships_path)

            plantUML = "@startuml\n"

            for entity in entities:
                plantUML += f"class {entity}\n"
            
            plantUML += '\n'

            for (attribute_name, source_entity) in attributes:
                plantUML += f"class {source_entity} " + "{\n    " + f"{attribute_name}\n" + "}\n"
            
            plantUML += '\n'

            for (relationship_name, source_entity, target_entity) in relationships:

                # Create class for source and target entity to make sure it exists
                plantUML += f"class {source_entity}\n"
                plantUML += f"class {target_entity}\n"
            
            plantUML += '\n'

            for (relationship_name, source_entity, target_entity) in relationships:
                plantUML += f"{source_entity} - {target_entity} : {relationship_name} >\n"

            plantUML += "@enduml\n"

            plantUML_output_file_path = os.path.join(DIRECTORY_PATH, f"{model_name}-0{i + 1}.puml")
            
            with open(plantUML_output_file_path, 'w') as file:
                for result in plantUML:
                    file.write(result)

    


if __name__ == "__main__":
    main()