import sys
sys.path.append(".")
from utils.original_text_merger import OriginalTextMerger


def check_tests(tests):

    are_all_tests_passing = True

    for test in tests:
        name = test["name"]
        numbers = test["input"]
        expected = test["expected"]
        actual = OriginalTextMerger.merge(numbers)

        is_test_failed = expected != actual
        if is_test_failed:
            print(f"Test failed: {name}\n")
            print(f"Expected: {expected}\n")
            print(f"Actual: {actual}\n")
            are_all_tests_passing = False

    if are_all_tests_passing:
        print("All tests are passing")


def run_tests():

    tests = [
        {
            "name": "no overlap",
            "input": [(0, 2, "l1"), (4, 8, "l2"), (9, 10, "l3")],
            "expected": [(0, 2, "l1"), (4, 8, "l2"), (9, 10, "l3")],
        },
        {
            "name": "no overlap unsorted",
            "input": [(9, 10, "l3"), (0, 2, "l1"), (4, 8, "l2")],
            "expected": [(0, 2, "l1"), (4, 8, "l2"), (9, 10, "l3")],
        },
        {
            "name": "duplicity",
            "input": [(2, 4, "l1"), (2, 4, "l2"), (2, 4, "l3")],
            "expected": [(2, 4, "l1, l2, l3")],
        },
        {
            "name": "common first index",
            "input": [(2, 4, "l1"), (2, 6, "l2"), (2, 8, "l3")],
            "expected": [(2, 4, "l1, l2, l3"), (5, 6, "l2, l3"), (7, 8, "l3")],
        },
        {
            "name": "continuous sequence",
            "input": [(0, 2, "l1"), (2, 4, "l2"), (4, 6, "l3")],
            "expected": [(0, 6, "l1, l2, l3")],
        },
        {
            "name": "simple full intersection",
            "input": [(0, 10, "l1"), (2, 6, "l2")],
            "expected": [(0, 1, "l1"), (2, 6, "l1, l2"), (7, 10, "l1")],
        },
        {
            "name": "full intersection",
            "input": [(0, 10, "l1"), (2, 6, "l2"), (3, 7, "l3"), (3, 10, "l4")],
            "expected": [(0, 1, "l1"), (2, 2, "l1, l2"), (3, 6, "l1, l2, l3, l4"), (7, 7, "l3, l4, l1"), (8, 10, "l1, l4")],
        },
        {
            "name": "half intersection simple",
            "input": [(0, 10, "l1"), (5, 15, "l2")],
            "expected": [(0, 4, "l1"), (5, 10, "l1, l2"), (11, 15, "l2")],
        },
        {
            "name": "half intersection",
            "input": [(0, 10, "l1"), (5, 15, "l2"), (5, 20, "l3")],
            "expected": [(0, 4, "l1"), (5, 10, "l1, l2, l3"), (11, 15, "l2, l3"), (16, 20, "l3")],
        },
        {
            "name": "last element full intersection",
            "input": [(2, 9, "l1"), (37, 44, "l1"), (0, 130, "l2")],
            "expected": [(0, 1, "l2"), (2, 9, "l2, l1"), (10, 36, "l2"), (37, 44, "l2, l1"), (45, 130, "l2")],
        },
    ]

    check_tests(tests)


def main():

    run_tests()


if __name__ == '__main__':
    main()
