import re
import os
import sys

sys.path.append("utils")
from domain_modeling import DOMAIN_DESCRIPTIONS_COUNT, DOMAIN_MODELING_DIRECTORY_PATH, DOMAIN_MODELS


def check(tags):

    is_properly_closed_list = [False] * len(tags)

    for i in range(len(tags)):
        tag = tags[i]
        if tag[0] == '/':
            continue

        is_properly_closed = False
        for j in range(len(tags)):
            tag2 = tags[j]

            if not is_properly_closed_list[j] and '/' + tag == tag2:
                is_properly_closed = True
                is_properly_closed_list[i] = True
                is_properly_closed_list[j] = True
                break
        
        if not is_properly_closed:
            print(f"Tag not properly closed: {tag}")


def main():

    for index, domain_model in enumerate(DOMAIN_MODELS):
        for i in range(DOMAIN_DESCRIPTIONS_COUNT[index]):

            file_name = f"domain-description-0{i + 1}-annotated.txt"
            file_path = os.path.join(DOMAIN_MODELING_DIRECTORY_PATH, domain_model, file_name)

            with open(file_path) as file:
                text = file.read()

            print(f"-- Checking: {file_path} --")

            tags = re.findall(r"<([^>]+)>", text)

            print(f"Tags found: {len(tags)}")

            check(tags)
            print()


if __name__ == "__main__":
    main()