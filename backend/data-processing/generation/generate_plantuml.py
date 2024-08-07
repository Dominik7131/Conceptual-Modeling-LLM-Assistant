import argparse
import os
import csv
import sys

sys.path.append(".")

from definitions.domain_modelling import DOMAIN_DESCRIPTIONS_COUNT, DOMAIN_MODELS
from definitions.utility import TextFilteringVariation, UserChoice


DIRECTORY_PATH = os.path.join("out", "actual")
SEPARATOR = ','


def process_classes(path):

    classes = []

    with open(path, "r", newline="", encoding="utf-8") as file:
        reader = csv.reader(file, delimiter=SEPARATOR)
        for index, row in enumerate(reader):
            if index == 0:
                continue

            clss = row[0]
            classes.append(f'"{clss}"')

    return classes


def process_attributes(path):

    attributes = []

    with open(path, "r", newline="", encoding="utf-8") as file:
        reader = csv.reader(file, delimiter=SEPARATOR)
        for index, row in enumerate(reader):
            if index == 0 or len(row) == 0:
                continue

            attribute_name = row[0]
            source_class = row[1]
            attributes.append((attribute_name, f'"{source_class}"'))

    return attributes


def process_associations(path):

    associations = []

    with open(path, "r", newline="", encoding="utf-8") as file:
        reader = csv.reader(file, delimiter=SEPARATOR)
        for index, row in enumerate(reader):
            if index == 0 or len(row) == 0:
                continue

            association_name = row[0]
            source_class = row[2]
            target_class = row[3]
            associations.append(
                (association_name, f'"{source_class}"', f'"{target_class}"'))

    return associations


def generate_plantuml(filteringVariation):

    for index, model_name in enumerate(DOMAIN_MODELS):
        for i in range(DOMAIN_DESCRIPTIONS_COUNT[index]):

            file_index = i + 1
            classes_path = os.path.join(DIRECTORY_PATH, f"{model_name}-{UserChoice.CLASSES.value}-actual-0{file_index}.csv")
            attributes_path = os.path.join(
                DIRECTORY_PATH, f"{model_name}-{UserChoice.ATTRIBUTES.value}-{filteringVariation}-actual-0{file_index}.csv")
            associations_path = os.path.join(
                DIRECTORY_PATH, f"{model_name}-{UserChoice.ASSOCIATIONS_ONE_KNOWN_CLASS.value}-{filteringVariation}-actual-0{file_index}.csv")

            if not os.path.isfile(classes_path):
                raise ValueError(f"Classes file not found: {classes_path}")

            if not os.path.isfile(attributes_path):
                raise ValueError(f"Attributes file not found: {attributes_path}")

            if not os.path.isfile(associations_path):
                raise ValueError(f"Associations file not found: {associations_path}")

            classes = process_classes(classes_path)
            attributes = process_attributes(attributes_path)
            associations = process_associations(associations_path)

            plantuml = "@startuml\n"

            for clss in classes:
                plantuml += f"class {clss}\n"

            plantuml += '\n'

            for (attribute_name, source_class) in attributes:
                plantuml += f"class {source_class} " + \
                    "{\n    " + f"{attribute_name}\n" + "}\n"

            plantuml += '\n'

            for (association_name, source_class, target_class) in associations:

                # Create class for source and target class to make sure it exists
                plantuml += f"class {source_class}\n"
                plantuml += f"class {target_class}\n"

            plantuml += '\n'

            for (association_name, source_class, target_class) in associations:
                plantuml += f"{source_class} - {target_class} : {association_name} >\n"

            plantuml += "@enduml\n"

            plantuml_output_file_path = os.path.join(
                DIRECTORY_PATH, f"{model_name}-0{i + 1}.puml")

            with open(plantuml_output_file_path, "w", encoding="utf-8") as file:
                for result in plantuml:
                    file.write(result)


def main():

    # The filtering variation is used to find the generated suggestion file names
    parser = argparse.ArgumentParser(description="Suggestions generator")
    parser.add_argument("--filtering", choices=[TextFilteringVariation.NONE.value, TextFilteringVariation.SYNTACTIC.value,
                        TextFilteringVariation.SEMANTIC.value], type=str, default=TextFilteringVariation.SYNTACTIC.value, help="Text filtering variation")

    args = parser.parse_args()

    generate_plantuml(args.filtering)


if __name__ == "__main__":
    main()
