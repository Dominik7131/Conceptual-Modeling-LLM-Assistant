from text_utility import ATTRIBUTES_STRING, RELATIONSHIPS_STRING, RELATIONSHIPS_STRING_TWO_ENTITIES

class UserInputProcessor():
    def __init__(self):
        self.messages = []
        self.entity_name = ""
        self.entity_name_2 = ""

    def handle_user_input(self):
        self.entity_name = input("Insert entity name: ").lower()
        print()
        user_message = self.entity_name

        if user_message.lower() == "exit" or user_message.lower() == "quit" or user_message.lower() == "q":
            return False
        
        self.user_choice = input("Input 'a' for attributes, 'r' for relationships, 'x' for relationships between two classes: ").lower()

        if self.user_choice == "a":
            self.user_choice = ATTRIBUTES_STRING

        elif self.user_choice == "r":
            self.user_choice = RELATIONSHIPS_STRING

        elif self.user_choice == "x":
            self.user_choice = RELATIONSHIPS_STRING_TWO_ENTITIES
            entities = self.entity_name.split(',')
            self.entity_name = entities[0]
            self.entity_name_2 = entities[1]
        else:
            raise ValueError(f"Error: Unknown user choice: {self.user_choice}.")

        return True