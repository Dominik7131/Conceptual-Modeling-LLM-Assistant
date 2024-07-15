import sys
sys.path.append(".")
from utils.convention_convertor import ConventionConvertor


def convert_name_to_standard_convention_test():

    input_names = ["snake_case", "snake_case_name_long", "Camel", "CamelCase", "CamelCaseLong",
                   "camelCaseWithLowerCasedFirstLetter", "standard case", "Capitalized Name", "animalID", "CAPSLOCK", "CONSISTS_OF", "Point3D"]
    expected_names = ["snake case", "snake case name long", "camel", "camel case", "camel case long",
                      "camel case with lower cased first letter", "standard case", "capitalized name", "animal id", "capslock", "consists of", "point 3d"]

    are_all_tests_passing = True

    for index, name in enumerate(input_names):
        actual_name = ConventionConvertor.convert_string_to_standard_convention(name)
        if actual_name != expected_names[index]:
            are_all_tests_passing = False
            print(f"Test failed:\n- Expected output: {expected_names[index]}\n- Actual output: {actual_name}")

    if are_all_tests_passing:
        print("All tests are passing")


def main():

    convert_name_to_standard_convention_test()


if __name__ == "__main__":
    main()
