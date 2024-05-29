

class OriginalTextMerger:

    def merge(input):

        input = sorted(input, key=lambda x: (x[0], x[1]))

        i = 0
        while i < len(input):

            if i + 1 >= len(input):
                break

            # [(x1, x2, l1), (y1, y2, l2)]
            x1, x2, l1 = input[i][0], input[i][1], input[i][2]
            y1, y2, l2 = input[i + 1][0], input[i + 1][1],  input[i + 1][2]

            is_still_sorted = x1 < y1 or (x1 == y1 and x2 <= y2)

            if not is_still_sorted:
                # E.g.: Input: [(2, 4, "l1"), (2, 6, "l2"), (2, 8, "l3")]
                # After first step: [(2, 4, "l1, l2"), (5, 6, "l2"), (2, 8, "l3")]
                # - first index in second tuple is greater than first index in third tuple
                # -> we need to sort the tuples again and start from the beginning
                input = sorted(input, key=lambda x: (x[0], x[1]))
                i = 0

            elif x1 == y1:

                if x2 == y2:
                    merged_tuples = (x1, x2, f"{l1}, {l2}")
                    input[i] = merged_tuples
                    input.pop(i + 1)

                else:
                    merged_tuples = (x1, x2, f"{l1}, {l2}")
                    input[i] = merged_tuples
                    input[i + 1] = (x2 + 1, y2, l2)

            elif x2 == y1:
                merged_tuples = (x1, y2, f"{l1}, {l2}")
                input[i] = merged_tuples
                input.pop(i + 1)

            
            elif x2 > y1 and x2 >= y2:

                new_1 = (x1, y1 - 1, l1)
                merged_tuples = (y1, y2, f"{l1}, {l2}")
                new_2 = (y2 + 1, x2, l1)

                input[i] = new_1
                input[i + 1] = merged_tuples
                input.insert(i + 2, new_2)
            
            elif x2 > y1 and x2 < y2:
                merged_tuples = (y1, x2, f"{l1}, {l2}")
                input[i] = (x1, y1 - 1, l1)
                input.insert(i + 1, merged_tuples)
                input[i + 2] = (x2 + 1, y2, l2)

            else:
                i += 1

        return input