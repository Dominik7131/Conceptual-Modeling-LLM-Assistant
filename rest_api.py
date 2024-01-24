from flask import Flask, request
from flask_cors import CORS, cross_origin
from LLM_assistant import LLMAssistant
import json

app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'
llm_assistant = None


# How to use curl with this script:
# curl.exe --request POST -F description=@input.txt -F entity1=school -F user_choice=a http://127.0.0.1:5000
# curl.exe --request POST -F description=@input.txt -F entity1=school -F user_choice=a http://u-pl5.ms.mff.cuni.cz:5000

# How to parse arguments from client:
# https://stackoverflow.com/questions/10434599/get-the-data-received-in-a-flask-request

# CORS error from frontend solution: https://stackoverflow.com/a/33091782

def create_suggest_mock_up(entity, user_choice, domain_description):
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


# Google Chrome: http://127.0.0.1:5000/?entity1=e&user_choice=a&domain_description=
@app.route('/suggest', methods=['GET'])
@cross_origin()
def suggest():
    #print(f"Received arguments: {request.args}")
    entity1 = request.args.get("entity1").lower()
    user_choice = request.args.get("user_choice")
    print("User choice: " + user_choice)
    domain_description = request.args.get("domain_description")

    is_mock_up = False
    if is_mock_up:
        return create_suggest_mock_up(entity1, user_choice, domain_description)
    
    suggestions = llm_assistant.suggest(entity1, "", user_choice, 5, conceptual_model=[], domain_description=domain_description)
    print("Suggestions:")
    print(suggestions[2:])
    return suggestions[2:]


def create_summary_mock_up(entities : list[str]) -> list[dict]:
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


@app.route('/summary', methods=['GET'])
@cross_origin()
def summary():
    entities_comma_separated = request.args.get("entities").lower()
    entities = entities_comma_separated.split(',')
    result = create_summary_mock_up(entities)
    return json.dumps(result)


# curl --data 'user=dom' http://127.0.0.1:5000
# @app.route('/curl', methods=['GET'])
# def curl():
#     print(request.form)
#     entity1 = request.form.get("entity1")
#     user_choice = request.form.get("user_choice")
#     file = request.files.get('description')
#     domain_description = str(file.read())
#     print(f"Domain description: {domain_description}")
    
#     return assistant.suggest(entity1=entity1, user_choice=user_choice, domain_description=domain_description)


@app.route('/test', methods=['GET'])
@cross_origin()
def test():
    dictionary = {"name": "rest-api-response", "inference": "lorem ipsum lorem ipsum lorem ipsum lorem ipsum", "data_type": "string"}
    return json.dumps(dictionary)




if __name__ == '__main__':

    # Define the model
    model_path_or_repo_id = "TheBloke/Llama-2-7B-Chat-GGUF"
    model_file = "llama-2-7b-chat.Q5_K_M.gguf"
    model_type = "llama"
    llm_assistant = LLMAssistant(model_path_or_repo_id=model_path_or_repo_id, model_file=model_file, model_type=model_type)

    app.run(port=5000) # host="0.0.0.0"