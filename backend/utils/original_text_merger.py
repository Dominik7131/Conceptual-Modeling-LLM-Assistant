

class OriginalTextMerger:

    @staticmethod
    def merge(numbers):

        numbers = sorted(numbers, key=lambda x: (x[0], x[1]))
        numbers = OriginalTextMerger.remove_duplicates(numbers)

        i = 0
        while i < len(numbers):

            if i + 1 >= len(numbers):
                break

            # [(x1, x2, l1), (y1, y2, l2)]
            x1, x2, l1 = numbers[i][0], numbers[i][1], numbers[i][2]
            y1, y2, l2 = numbers[i + 1][0], numbers[i + 1][1], numbers[i + 1][2]

            is_still_sorted = (x1 < y1 or (x1 == y1 and x2 <= y2))

            if not is_still_sorted:

                # E.g.: Input: [(2, 4, "l1"), (2, 6, "l2"), (2, 8, "l3")]
                # After first step: [(2, 4, "l1, l2"), (5, 6, "l2"), (2, 8, "l3")]
                # - first index in second tuple is greater than first index in third tuple
                # -> we need to sort the tuples again and start from the beginning
                numbers = sorted(numbers, key=lambda x: (x[0], x[1]))
                i = 0

            elif x1 == y1:

                if x2 == y2:
                    merged_tuples = (x1, x2, f"{l1}, {l2}")
                    numbers[i] = merged_tuples
                    numbers.pop(i + 1)

                else:
                    merged_tuples = (x1, x2, f"{l1}, {l2}")
                    numbers[i] = merged_tuples
                    numbers[i + 1] = (x2 + 1, y2, l2)

            elif x2 == y1:

                merged_tuples = (x1, y2, f"{l1}, {l2}")
                numbers[i] = merged_tuples
                numbers.pop(i + 1)

            elif x2 > y1 and x2 >= y2:

                new_1 = (x1, y1 - 1, l1)
                merged_tuples = (y1, y2, f"{l1}, {l2}")
                new_2 = (y2 + 1, x2, l1)

                numbers[i] = new_1
                numbers[i + 1] = merged_tuples

                if new_2[0] < new_2[1]:
                    numbers.insert(i + 2, new_2)

            elif y2 > x2 > y1:

                merged_tuples = (y1, x2, f"{l1}, {l2}")
                numbers[i] = (x1, y1 - 1, l1)
                numbers.insert(i + 1, merged_tuples)
                numbers[i + 2] = (x2 + 1, y2, l2)

            else:

                i += 1

        return numbers

    @staticmethod
    def remove_duplicates(data):

        seen = set()
        unique_elements = []

        for element in data:

            indices = (element[0], element[1], element[2])

            # If the indices tuple has not been seen, add it to the set and the unique_elements list
            if indices not in seen:
                seen.add(indices)
                unique_elements.append(element)

        return unique_elements
