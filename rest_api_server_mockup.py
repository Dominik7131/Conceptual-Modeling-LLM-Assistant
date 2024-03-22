from flask import Flask, request
from flask_cors import CORS, cross_origin
import json
import time

app = Flask(__name__)
llm_assistant = None

# TODO: Try to remove CORS by filling in the header properly
# CORS error from frontend solution: https://stackoverflow.com/a/33091782
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type' 


@app.route('/suggest', methods=['POST'])
@cross_origin()
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
            if user_choice == "attributes" or user_choice == "entity":
                yield '{"inference": "the type of engine specified by the manufacturer of the road vehicle", "name": "type of engine", "inference_indexes": [], "dataType": "string"}\n'
                # time.sleep(2)
                yield '{"inference": "the fuel type of the road vehicle", "name": "fuel type", "inference_indexes": [0, 20], "dataType": "string"}\n'
                # time.sleep(2)
            else:
                yield '{"name": "enrolled in", "inference": "Students can be enrolled in any number of courses", "inference_indexes": [10,20], "source": "student", "target": "course"}\n'
                yield '{"name": "accommodated in", "inference": "students can be accommodated in dormitories", "inference_indexes": [20,100], "source": "student", "target": "dormitory"}\n'
        return generate_mock_up()


@app.route('/summary1', methods=['POST'])
@cross_origin()
def summary():

    body_data = request.get_json()
    domain_description = body_data["domainDescription"]
    conceptual_model = body_data["conceptualModel"]

    def generate_mock_up():
        yield '{"summary": "The conceptual model includes four main entities: Student, Course, Dormitory, and Professor. The Student entity has a name attribute and can be enrolled in any number of Courses. The Course entity has a name and a number of credits attribute, and can have one or more Professors. The Dormitory entity has a price attribute, and students can be accommodated in it. The Professor entity has a name attribute. Additionally, there is a relationship between Student and Person through an \'is-a\' relationship."}\n'
        return

    return generate_mock_up()


@app.route('/getOnly', methods=['POST'])
@cross_origin()
def get_only():

    def generator_function(field):

        if field == "description":
            dictionary = { field: "The engine type attribute of a road vehicle refers to the specific classification assigned by the manufacturer to denote the kind of engine installed in the vehicle. It encompasses various types such as internal combustion engines or other alternative propulsion systems. This attribute provides crucial information about the power source and characteristics of the engine, aiding in regulatory compliance, maintenance, and performance assessment."}
        elif field == "cardinality":
            dictionary = { field: "1..*"}

        yield json.dumps(dictionary)

    body_data = request.get_json()
    source_entity = body_data["sourceEntity"]
    attribute_name = body_data["attributeName"]
    field = body_data["field"]
    domain_description = body_data["domainDescription"]

    return generator_function(field)


@app.route('/test', methods=['GET'])
@cross_origin()
def test():
    dictionary = {"name": "rest-api-response", "inference": "lorem ipsum lorem ipsum lorem ipsum lorem ipsum", "data_type": "string"}
    return json.dumps(dictionary)


@app.route('/stream_test')
@cross_origin()
def stream_test():

    def generate_items():
        yield f"Number: {1}\n"
        yield f"Number: {2}\n"
        yield f"Number: {3}\n"

    return generate_items()


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
                dictionary1 = json.dumps({"name": "name", "inference": "student has a name", "data_type": "string"})
                return [dictionary1]
        else:
            dictionary1 = json.dumps({"name": "enrolled in", "inference": "Students can be enrolled in any number of courses", "source_entity": "student", "target_entity": "course"})
            dictionary2 = json.dumps({"name": "accommodated in", "inference": "students can be accommodated in dormitories", "source_entity": "student", "target_entity": "dormitory"})

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
                dictionary1 = json.dumps({"name": "name", "inference": "courses have a name", "data_type": "string"})
                dictionary2 = json.dumps({"name": "number of credits", "inference": "courses have a specific number of credits", "data_type": "string"})
                return [dictionary1, dictionary2]
        else:
            dictionary1 = json.dumps({"name": "has", "inference": "each course can have one or more professors", "source_entity": "course", "target_entity": "professor"})
            dictionary2 = json.dumps({"name": "aggregates", "inference": "for a course to exist, it must aggregate at least, five students", "source_entity": "course", "target_entity": "student"})
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
                dictionary1 = json.dumps({"name": "name", "inference": "professors, who have a name", "data_type": "string"})
                return [dictionary1]
        else:
            dictionary1 = json.dumps({"name": "can participate in", "inference": "Professors could pariticipate in any number of courses", "source_entity": "professor", "target_entity": "course"})
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
                dictionary1 = json.dumps({"name": "price", "inference": "each dormitory has a price", "data_type": "int"})
                return [dictionary1]
        else:
            dictionary1 = json.dumps({"name": "has", "inference": "students can be accomodated in dormitories", "source_entity": "dormitory", "target_entity": "student"})
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


if __name__ == '__main__':
    app.run(port=5002)