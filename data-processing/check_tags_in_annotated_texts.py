import re
import time
import os

DIRECTORY_PATH = os.path.join("domain-modeling-benchmark", "domain-models")
FILE_PATH = os.path.join(DIRECTORY_PATH, "farming 97627e23829afb", "domain-description-03-annotated.txt")

domain_models = ["aircraft manufacturing 48982a787d8d25", "conference papers 56cd5f7cf40f52", "farming 97627e23829afb"]
DOMAIN_DESCRIPTIONS_COUNT = 3


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

    for domain_model in domain_models:
        for i in range(DOMAIN_DESCRIPTIONS_COUNT):

            file_name = f"domain-description-0{i + 1}-annotated.txt"
            file_path = os.path.join(DIRECTORY_PATH, domain_model, file_name)

            with open(file_path) as file:
                text = file.read()

            print(f"--Checking: {file_path}--")

            tags = re.findall(r'<([^>]+)>', text)

            print(f"Tags found: {len(tags)}")

            check(tags)
            print()


if __name__ == "__main__":
    main()