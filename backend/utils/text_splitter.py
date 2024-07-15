import re

from definitions.utility import PRONOUNS_TO_DETECT
from utils.text_utility import TextUtility

ALPHABETS = "([A-Za-z])"
PREFIXES = "(Mr|St|Mrs|Ms|Dr)[.]"
SUFFIXES = "(Inc|Ltd|Jr|Sr|Co)"
STARTERS = "(Mr|Mrs|Ms|Dr|Prof|Capt|Cpt|Lt|He\s|She\s|It\s|They\s|Their\s|Our\s|We\s|But\s|However\s|That\s|This\s|Wherever)"
ACRONYMS = "([A-Z][.][A-Z][.](?:[A-Z][.])?)"
WEBSITES = "[.](com|net|org|io|gov|edu|me)"
DIGITS = "([0-9])"
MULTIPLE_DOTS = r"\.{2,}"


class TextSplitter:

    # Source: https://stackoverflow.com/a/31505798
    @staticmethod
    def split_into_sentences(text: str) -> list[str]:
        """
        Split the text into sentences.

        If the text contains substrings "<prd>" or "<stop>", they would lead 
        to incorrect splitting because they are used as markers for splitting.

        :param text: text to be split into sentences
        :type text: str

        :return: list of sentences
        :rtype: list[str]
        """
        text = " " + text + "  "
        text = text.replace("\n", " ")
        text = re.sub(PREFIXES, "\\1<prd>", text)
        text = re.sub(WEBSITES, "<prd>\\1", text)
        text = re.sub(DIGITS + "[.]" + DIGITS, "\\1<prd>\\2", text)
        text = re.sub(MULTIPLE_DOTS, lambda match: "<prd>" * len(match.group(0)) + "<stop>", text)

        # Titles
        if "Ph.D" in text:
            text = text.replace("Ph.D.", "Ph<prd>D<prd>")
        if "B.Sc." in text:
            text = text.replace("B.Sc.", "B<prd>Sc<prd>")
        if "B.A." in text:
            text = text.replace("B.A.", "B<prd>A<prd>")
        if "Ing." in text:
            text = text.replace("Ing.", "Ing<prd>")
        if "Ing. arch." in text:
            text = text.replace("Ing. arch.", "Ing<prd> arch<prd>")
        if "M.D." in text:
            text = text.replace("M.D.", "M<prd>D<prd>")
        if "MDDr." in text:
            text = text.replace("MDDr.", "MDDr<prd>")
        if "MVDr." in text:
            text = text.replace("MVDr.", "MVDr<prd>")
        if "MgA." in text:
            text = text.replace("MgA.", "MgA<prd>")
        if "Mgr." in text:
            text = text.replace("Mgr.", "Mgr<prd>")

        text = re.sub("\s" + ALPHABETS + "[.] ", " \\1<prd> ", text)
        text = re.sub(ACRONYMS + " " + STARTERS, "\\1<stop> \\2", text)
        text = re.sub(ALPHABETS + "[.]" + ALPHABETS + "[.]" + ALPHABETS + "[.]", "\\1<prd>\\2<prd>\\3<prd>", text)
        text = re.sub(ALPHABETS + "[.]" + ALPHABETS + "[.]", "\\1<prd>\\2<prd>", text)
        text = re.sub(" " + SUFFIXES + "[.] " + STARTERS, " \\1<stop> \\2", text)
        text = re.sub(" " + SUFFIXES + "[.]", " \\1<prd>", text)
        text = re.sub(" " + ALPHABETS + "[.]", " \\1<prd>", text)
        if "”" in text:
            text = text.replace(".”", "”.")
        if "\"" in text:
            text = text.replace(".\"", "\".")
        if "!" in text:
            text = text.replace("!\"", "\"!")
        if "?" in text:
            text = text.replace("?\"", "\"?")
        text = text.replace(".", ".<stop>")
        text = text.replace("?", "?<stop>")
        text = text.replace("!", "!<stop>")
        text = text.replace("<prd>", ".")
        sentences = text.split("<stop>")
        sentences = [s.strip() for s in sentences]
        if sentences and not sentences[-1]:
            sentences = sentences[:-1]
        return sentences

    @staticmethod
    def get_sentences(text):

        # Divide the text into: sentences and bullet points
        lines = text.split(sep="\n")
        lines = list(filter(None, lines))  # Remove empty elements
        sentences = [TextSplitter.split_into_sentences(line) for line in lines]
        sentences = [x for xs in sentences for x in xs]  # flatten sentences

        return sentences

    @staticmethod
    def split_into_chunks(domain_description):

        original_chunks = TextSplitter.get_sentences(domain_description)
        enhanced_chunks = []
        text_before_bullet_points = ""
        is_bullet_point_processing = False

        # If a sentence contains pronoun then enhance the chunk by adding the previous sentence
        # It would be better to replace the pronoun instead however, there is no easy way to do this.
        is_pronouns_enhancement = True

        for index, sentence in enumerate(original_chunks):

            if index == 0:
                enhanced_chunks.append(sentence)
                continue

            is_bullet_point = TextUtility.is_bullet_point(sentence)

            if is_bullet_point_processing:
                if is_bullet_point:
                    enhanced_chunks.append(f"{sentence[:2]}{text_before_bullet_points} {sentence[2:]}")
                else:
                    is_bullet_point_processing = False
                    enhanced_chunks.append(sentence)
                continue

            if is_bullet_point:
                # For each bullet point prepend text from row before these bullet points
                text_before_bullet_points = original_chunks[index - 1]
                enhanced_chunks.append(f"{sentence[:2]}{text_before_bullet_points} {sentence[2:]}")
                is_bullet_point_processing = True
                continue

            is_sentence_enhanced = False
            if is_pronouns_enhancement:
                for pronoun in PRONOUNS_TO_DETECT:
                    if sentence.startswith(pronoun):
                        is_sentence_enhanced = True
                        enhanced_chunks.append(f"{original_chunks[index - 1]} {sentence}")
                        break

            if not is_sentence_enhanced:
                enhanced_chunks.append(sentence)

        return enhanced_chunks, original_chunks
