import json
import sys
import time

sys.path.append("utils")

from definitions.utility import UserChoice
from flask import Flask, request
from flask_cors import CORS
from original_text_merger import OriginalTextMerger

PORT = 5001

app = Flask(__name__)
cors = CORS(app)
app.config["CORS_HEADERS"] = "Content-Type"


@app.route("/suggest/items", methods=["POST"])
def suggest_items():

    body_data = request.get_json()
    user_choice = body_data["userChoice"]
    text_filtering_variation = body_data["textFilteringVariation"]

    print(f"fv: {text_filtering_variation}")

    def generate_mock_up():

        # time.sleep(2)
        if user_choice in (UserChoice.ATTRIBUTES.value, UserChoice.CLASSES.value):
            # specific classification or categorization denoting the particular design and specifications of the engine installed in a motorized vehicle
            yield '{"originalText": "the type of engine specified by the manufacturer of the road vehicle", "name": "type of engine", "originalTextIndexes": [], "description": ""}\n'
            # time.sleep(2)
            yield '{"originalText": "the fuel type of the road vehicle", "name": "fuel type", "originalTextIndexes": [1000, 1030], "dataType": "string", "description": "specific type of fuel utilized by the engine of a road vehicle"}\n'
            # time.sleep(2)
        else:
            yield '{"name": "enrolled in", "originalText": "Students can be enrolled in any number of courses", "originalTextIndexes": [10,20], "source": "farmer", "target": "fruit and something"}\n'
            yield '{"name": "accommodated in", "originalText": "students can be accommodated in dormitories", "originalTextIndexes": [20,100], "source": "student and x", "target": "farmer"}\n'

    return generate_mock_up()


@app.route("/suggest/single_field", methods=["POST"])
def suggest_single_field():

    def generator_function(field):

        if field == "name":
            dictionary = {field: "Regenerated name"}
        elif field == "description":
            dictionary = {field: "The engine type attribute of a road vehicle refers to the specific classification assigned by the manufacturer to denote the kind of engine installed in the vehicle. It encompasses various types such as internal combustion engines or other alternative propulsion systems. This attribute provides crucial information about the power source and characteristics of the engine, aiding in regulatory compliance, maintenance, and performance assessment."}
        elif field == "originalText":
            dictionary = {field: "Regenerated original text"}
        elif field == "dataType":
            dictionary = {field: "string"}
        elif field == "sourceCardinality" or field == "targetCardinality":
            dictionary = {field: "one-many"}
        elif field == "source":
            dictionary = {field: "New source class"}
        elif field == "target":
            dictionary = {field: "New target class"}
        else:
            dictionary = {field: "Some new text"}

        yield json.dumps(dictionary)

    body_data = request.get_json()
    field = body_data["field"]

    return generator_function(field)


def generate_summary_plain_text_mock_up():

    yield '{"summary": "The conceptual model includes four main classes: Student, Course, Dormitory, and Professor. The Student class has a name attribute and can be enrolled in any number of Courses. The Course class has a name and a number of credits attribute, and can have one or more Professors. The Dormitory class has a price attribute, and students can be accommodated in it. The Professor class has a name attribute. Additionally, there is an association between Student and Person through an \'is-a\' association."}\n'
    return


def generate_summary_descriptions_mock_up():

    yield '{"class": "engine","description": "An engine class represents the power source of a vehicle.","attributes": [{"name": "engine type","description": "The type of engine, such as internal combustion, electric, etc."},{"name": "engine power","description": "The power output of the engine, typically measured in kilowatts (kW)."},{"name": "fuel type","description": "The type of fuel used by the engine, such as gasoline, diesel, electricity, etc."}]}\n'
    time.sleep(1)
    yield '{"association": "has", "sourceClass": "course", "targetClass": "professor", "description": "Courses have professors who teach them"}\n'
    time.sleep(1)
    yield '{"association": "enrolled in", "sourceClass": "student", "targetClass": "course", "description": "Students can be enrolled in any number of courses"}\n'
    time.sleep(1)
    yield '{"association": "accommodated in", "sourceClass": "student", "targetClass": "dormitory", "description": "Students can be accommodated in dormitories"}\n'
    return


@app.route("/suggest/summary", methods=["POST"])
def suggest_summary():

    body_data = request.get_json()
    summary_type = body_data["summaryType"]

    if summary_type == UserChoice.SUMMARY_PLAIN_TEXT.value:
        return generate_summary_plain_text_mock_up()

    elif summary_type == UserChoice.SUMMARY_DESCRIPTIONS.value:
        return generate_summary_descriptions_mock_up()

    else:
        return f"Unexpected summary type: {summary_type}", 400


@app.route("/merge_original_texts", methods=["POST"])
def merge_original_texts():

    time.sleep(2)
    body_data = request.get_json()
    original_text_indexes_object = body_data["originalTextIndexesObject"]
    print(f"Received: {original_text_indexes_object}\n")

    parsed_original_text_indexes_object = [
        (item["indexes"][0], item["indexes"][1], item["label"]) for item in original_text_indexes_object]
    # print(f"Parsed object: {parsed_original_text_indexes_object}\n")

    result = OriginalTextMerger.merge(parsed_original_text_indexes_object)

    print(f"{result}\n")
    return result


def create_summary_mockup(classes):

    result = []

    if "student" in classes:
        result.append(json.dumps({"class": "student",
                                  "attributes": [{"name": "name", "description": "Represents the name of the student."}],
                                  "associations": [{"name": "accommodated in", "description": "Describes the association between a student and a dormitory. A student can be accommodated in a dormitory."},
                                                   {"name": "enrolled in", "description": "Indicates the enrollment association between a student and a course. A student can be enrolled in multiple courses."}]}))

    if "course" in classes:
        result.append(json.dumps({"class": "course",
                                  "attributes": [{"name": "name", "description": "Represents the name of the course"},
                                                 {"name": "number of credits", "description": "Indicates the number of credits associated with the course"}],
                                  "associations": [{"name": "has", "description": "Describes the association between a course and a professor. A course can be taught by one or more professors."},
                                                   {"name": "aggregates", "description": "Indicates the association between a course and a student. A course can have multiple students enrolled in it."}]}))

    if "professor" in classes:
        result.append(json.dumps({"class": "professor",
                                  "attributes": [{"name": "name", "description": "Represents the name of the professor."}],
                                  "associations": [{"name": "participates in", "description": "Describes the participation association between a professor and a course. A professor can participate in teaching multiple courses."}]}))

    if "dormitory" in classes:
        result.append(json.dumps({"class": "dormitory",
                                  "attributes": [{"name": "price", "description": "Represents the price of accommodation in the dormitory."}],
                                  "associations": [{"name": "accommodates", "description": "Indicates the association between a dormitory and a student. A dormitory can accommodate multiple students."}]}))
    return result


@app.route("/save/suggested_item", methods=["POST"])
def save_suggested_item():

    body_data = request.get_json()
    domain_description = body_data["domainDescription"]
    item = body_data["item"]
    is_positive = body_data["isPositive"]
    text_filtering_variation = body_data["textFilteringVariation"]

    print(f"Text filtering variation: {text_filtering_variation}")

    completed_item = {"domain_description": domain_description,
                      "item": item, "is_positive": is_positive}
    print(completed_item)

    return "Done"


@app.route("/save/suggested_single_field", methods=["POST"])
def save_suggested_single_field():

    body_data = request.get_json()
    field_name = body_data["fieldName"]
    field_text = body_data["fieldText"]
    domain_description = body_data["domainDescription"]
    is_positive = body_data["isPositive"]
    text_filtering_variation = body_data["textFilteringVariation"]

    print(f"Text filtering variation: {text_filtering_variation}")

    completed_item = {"domain_description": domain_description,
                      "field_name": field_name, "field_text": field_text, "is_positive": is_positive}
    print(completed_item)

    return "Done"


@app.route("/save/suggested_summary", methods=["POST"])
def save_suggested_summary():

    body_data = request.get_json()
    domain_description = body_data["domainDescription"]
    conceptual_model = body_data["conceptualModel"]
    summary = body_data["summary"]
    is_positive = body_data["isPositive"]

    completed_item = {"domain_description": domain_description, "summary": summary,
                      "is_positive": is_positive, "conceptual_model": conceptual_model}
    print(completed_item)

    return "Done"


@app.route('/')
def index():

    return "LLM assistant backend"


if __name__ == "__main__":
    app.run(port=PORT, threaded=False)
