from flask import Flask, request
from flask_cors import CORS, cross_origin
import json
import time
import sys

sys.path.append('utils/')
from text_utility import TextUtility


app = Flask(__name__)
llm_assistant = None


# CORS error from frontend solution: https://stackoverflow.com/a/33091782
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type' 


@app.route('/suggest', methods=['POST'])
def suggest():
    body_data = request.get_json()
    sourceEntity = body_data["sourceEntity"]
    targetEntity = body_data["targetEntity"]
    user_choice = body_data["userChoice"]
    domain_description = body_data["domainDescription"]

    is_stream_output = True
    
    if not is_stream_output:
        return create_suggest_mockup(sourceEntity, user_choice, domain_description)
    else:
        def generate_mock_up():
            # time.sleep(2)
            if user_choice == "attributes" or user_choice == "entities":
                yield '{"originalText": "the type of engine specified by the manufacturer of the road vehicle", "name": "type of engine", "originalTextIndexes": [], "dataType": "string", "description": ""}\n' #specific classification or categorization denoting the particular design and specifications of the engine installed in a motorized vehicle
                # time.sleep(2)
                yield '{"originalText": "the fuel type of the road vehicle", "name": "fuel type", "originalTextIndexes": [5569, 6017], "dataType": "string", "description": "specific type of fuel utilized by the engine of a road vehicle"}\n'
                # time.sleep(2)
                pass
            else:
                yield '{"name": "enrolled in", "originalText": "Students can be enrolled in any number of courses", "originalTextIndexes": [10,20], "source": "farmer", "target": "fruit and something"}\n'
                yield '{"name": "accommodated in", "originalText": "students can be accommodated in dormitories", "originalTextIndexes": [20,100], "source": "student and x", "target": "farmer"}\n'
        return generate_mock_up()


@app.route('/summary_plain_text', methods=['POST'])
def summary_plain_text():

    def generate_mock_up():
        yield '{"summary": "The conceptual model includes four main entities: Student, Course, Dormitory, and Professor. The Student entity has a name attribute and can be enrolled in any number of Courses. The Course entity has a name and a number of credits attribute, and can have one or more Professors. The Dormitory entity has a price attribute, and students can be accommodated in it. The Professor entity has a name attribute. Additionally, there is a relationship between Student and Person through an \'is-a\' relationship."}\n'
        return

    return generate_mock_up()


@app.route('/summary_descriptions', methods=['POST'])
def summary_descriptions():

    def generate_mock_up():
        # time.sleep(1)
        yield '{"entity": "engine","description": "An engine entity represents the power source of a vehicle.","attributes": [{"name": "engine type","description": "The type of engine, such as internal combustion, electric, etc."},{"name": "engine power","description": "The power output of the engine, typically measured in kilowatts (kW)."},{"name": "fuel type","description": "The type of fuel used by the engine, such as gasoline, diesel, electricity, etc."}]}\n'
        time.sleep(1)
        yield '{"relationship": "has", "sourceEntity": "course", "targetEntity": "professor", "description": "Courses have professors who teach them"}\n'
        time.sleep(1)
        yield '{"relationship": "enrolled in", "sourceEntity": "student", "targetEntity": "course", "description": "Students can be enrolled in any number of courses"}\n'
        time.sleep(1)
        yield '{"relationship": "accommodated in", "sourceEntity": "student", "targetEntity": "dormitory", "description": "Students can be accommodated in dormitories"}\n'
        return

    return generate_mock_up()


@app.route('/getOnly', methods=['POST'])
def get_only():

    def generator_function(field):
        if field == "name":
            dictionary = { field: "Regenerated name" }
        elif field == "description":
            dictionary = { field: "The engine type attribute of a road vehicle refers to the specific classification assigned by the manufacturer to denote the kind of engine installed in the vehicle. It encompasses various types such as internal combustion engines or other alternative propulsion systems. This attribute provides crucial information about the power source and characteristics of the engine, aiding in regulatory compliance, maintenance, and performance assessment."}
        elif field == "originalText":
            dictionary = { field: "Regenerated original text" }
        elif field == "dataType":
            dictionary = { field: "string" }
        elif field == "sourceCardinality" or field == "targetCardinality":
            dictionary = { field: "one-many"}
        elif field == "source":
            dictionary = { field: "New source entity"}
        elif field == "target":
            dictionary = { field: "New target entity"}
        else:
            dictionary = { field: "Some new text"}

        yield json.dumps(dictionary)


    body_data = request.get_json()
    field = body_data["field"]

    return generator_function(field)


@app.route('/merge_original_texts', methods=['POST'])
def merge_original_texts():

    body_data = request.get_json()
    original_text_indexes_object = body_data["originalTextIndexesObject"]
    # print(f"Received: {original_text_indexes_object}\n")

    parsed_original_text_indexes_object = [(item['indexes'][0], item['indexes'][1], item['label']) for item in original_text_indexes_object]
    # print(f"Parsed object: {parsed_original_text_indexes_object}\n")
    result = TextUtility.merge_original_texts(parsed_original_text_indexes_object)

    # print(f"{result}\n")
    return result


def create_suggest_mockup(entity, user_choice, domain_description):
    if entity == "student":
        if user_choice == "a":
            if domain_description == "":
                dictionary = [
                    json.dumps({"name": "ID", "data_type": "integer"}),
                    json.dumps({"name": "name", "data_type": "string"}),
                    json.dumps({"name": "age", "data_type": "integer"}),
                    json.dumps({"name": "grade", "data_type": "float"}),
                    json.dumps({"name": "enrollment date", "data_type": "date"}),
                    ]
                return dictionary
            else:
                dictionary1 = json.dumps({"name": "name", "originalText": "student has a name", "data_type": "string"})
                return [dictionary1]
        else:
            dictionary1 = json.dumps({"name": "enrolled in", "originalText": "Students can be enrolled in any number of courses", "source_entity": "student", "target_entity": "course"})
            dictionary2 = json.dumps({"name": "accommodated in", "originalText": "students can be accommodated in dormitories", "source_entity": "student", "target_entity": "dormitory"})

            return [dictionary1, dictionary2]
    
    elif entity == "course":
        if user_choice == "a":
            if domain_description == "":
                dictionary = [
                    json.dumps({"name": "code", "data_type": "string"}),
                    json.dumps({"name": "title", "data_type": "string"}),
                    json.dumps({"name": "instructor", "data_type": "string"}),
                    json.dumps({"name": "enrollment capacity", "data_type": "integer"}),
                    json.dumps({"name": "schedule", "data_type": "array"}),
                ]
                return dictionary
            else:
                dictionary1 = json.dumps({"name": "name", "originalText": "courses have a name", "data_type": "string"})
                dictionary2 = json.dumps({"name": "number of credits", "originalText": "courses have a specific number of credits", "data_type": "string"})
                return [dictionary1, dictionary2]
        else:
            dictionary1 = json.dumps({"name": "has", "originalText": "each course can have one or more professors", "source_entity": "course", "target_entity": "professor"})
            dictionary2 = json.dumps({"name": "aggregates", "originalText": "for a course to exist, it must aggregate at least, five students", "source_entity": "course", "target_entity": "student"})
            return [dictionary1, dictionary2]
    
    elif entity == "professor":
        if user_choice == "a":
            if domain_description == "":
                dictionary = [
                    json.dumps({"name": "name", "data_type": "string"}),
                    json.dumps({"name": "age", "data_type": "integer"}),
                    json.dumps({"name": "subject", "data_type": "string"}),
                    json.dumps({"name": "years of experience", "data_type": "integer"}),
                    json.dumps({"name": "education", "data_type": "string"}),
                ]
                return dictionary
            else:
                dictionary1 = json.dumps({"name": "name", "originalText": "professors, who have a name", "data_type": "string"})
                return [dictionary1]
        else:
            dictionary1 = json.dumps({"name": "can participate in", "originalText": "Professors could pariticipate in any number of courses", "source_entity": "professor", "target_entity": "course"})
            return [dictionary1]
    
    elif entity == "dormitory":
        if user_choice == "a":
            if domain_description == "":
                dictionary = [
                    json.dumps({"name": "building name", "data_type": "string"}),
                    json.dumps({"name": "capacity", "data_type": "integer"}),
                    json.dumps({"name": "occupancy", "data_type": "integer"}),
                    json.dumps({"name": "facilities", "data_type": "array"}),
                    json.dumps({"name": "usage type", "data_type": "string"}),
                ]
                return dictionary
            else:
                dictionary1 = json.dumps({"name": "price", "originalText": "each dormitory has a price", "data_type": "int"})
                return [dictionary1]
        else:
            dictionary1 = json.dumps({"name": "has", "originalText": "students can be accomodated in dormitories", "source_entity": "dormitory", "target_entity": "student"})
            return [dictionary1]


def create_summary_mockup(entities : list[str]) -> list[dict]:
    result = []

    if "student" in entities:
        result.append(json.dumps({"entity": "student",
                                  "attributes": [{"name": "name", "description": "Represents the name of the student."}],
                                  "relationships": [{"name": "accommodated in", "description": "Describes the relationship between a student and a dormitory. A student can be accommodated in a dormitory."},
                                                    {"name": "enrolled in", "description": "Indicates the enrollment relationship between a student and a course. A student can be enrolled in multiple courses."}] }))
    
    if "course" in entities:
        result.append(json.dumps({"entity": "course",
                                  "attributes": [{"name": "name", "description": "Represents the name of the course"},
                                                 {"name": "number of credits", "description": "Indicates the number of credits associated with the course"}],
                                  "relationships": [{"name": "has", "description": "Describes the relationship between a course and a professor. A course can be taught by one or more professors."},
                                                    {"name": "aggregates", "description": "Indicates the relationship between a course and a student. A course can have multiple students enrolled in it."}]}))
    
    if "professor" in entities:
        result.append(json.dumps({"entity": "professor",
                                  "attributes": [{"name": "name", "description": "Represents the name of the professor."}],
                                  "relationships": [{"name": "participates in", "description": "Describes the participation relationship between a professor and a course. A professor can participate in teaching multiple courses."}]}))
    
    if "dormitory" in entities:
        result.append(json.dumps({"entity": "dormitory",
                                  "attributes": [{"name": "price", "description": "Represents the price of accommodation in the dormitory."}],
                                  "relationships": [{"name": "accommodates", "description": "Indicates the relationship between a dormitory and a student. A dormitory can accommodate multiple students."}]}))
    return result


@app.route('/save_suggested_item', methods=['POST'])
def save_suggested_item():

    body_data = request.get_json()
    user_choice = body_data["userChoice"]
    domain_description = body_data["domainDescription"]
    item = body_data["item"]
    isPositive = body_data["isPositive"]

    completed_item = { "domain_description": domain_description, "item": item, "is_positive": isPositive }
    print(completed_item)

    return "Done"


@app.route('/save_suggested_single_field', methods=['POST'])
def save_suggested_single_field():

    body_data = request.get_json()
    user_choice = body_data["userChoice"]
    field_name = body_data["fieldName"]
    field_text = body_data["fieldText"]
    domain_description = body_data["domainDescription"]
    isPositive = body_data["isPositive"]

    completed_item = { "domain_description": domain_description, "field_name": field_name, "field_text": field_text, "is_positive": isPositive }
    print(completed_item)

    return "Done"


@app.route('/save_suggested_description', methods=['POST'])
def save_suggested_description():

    body_data = request.get_json()
    user_choice = body_data["userChoice"]
    domain_description = body_data["domainDescription"]
    conceptual_model = body_data["conceptualModel"]
    summary = body_data["summary"]
    isPositive = body_data["isPositive"]

    completed_item = { "domain_description": domain_description, "summary": summary, "is_positive": isPositive, "conceptual_model": conceptual_model }
    print(completed_item)

    return "Done"


if __name__ == '__main__':
    app.run(port=5000, threaded=True)