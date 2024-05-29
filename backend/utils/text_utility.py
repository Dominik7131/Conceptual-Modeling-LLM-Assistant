
class TextUtility:

    def prettify_messages(messages):
        result = ""
        for message in messages:
            result += f"{message['role']}: {message['content']}\n"
        
        return result


    def is_bullet_point(text):

        # E.g.: - text, * text, (a) text
        if text[0] == '-' or text[0] == '*' or text[0] == '(':
            return True
        
        # For example text starts with: "I)", "a)", "I."
        if len(text) > 1 and (text[1] == ')' or text[1] == '.'):
            return True

        # For example text starts with: "15)", "aa)", "15."
        if len(text) > 2 and (text[2] == ')' or text[2] == '.'):
            return True
        
        return False