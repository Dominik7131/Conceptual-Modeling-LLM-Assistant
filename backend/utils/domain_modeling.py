import os

DOMAIN_MODELING_BENCHMARK_DIRECTORY = "domain-modeling-benchmark"
DOMAIN_MODELING_DIRECTORY_PATH = os.path.join(DOMAIN_MODELING_BENCHMARK_DIRECTORY, "evaluation domain models")

DOMAIN_MODELS = ["aircraft manufacturing 48982a787d8d25", "conference papers 56cd5f7cf40f52", "farming 97627e23829afb",
                 "college 1dc8e791-1d0e-477c-b5c2-24e376e3f6f1", "zoological gardens e95b5ea472deb8",
                 "registry of road vehicles 60098f15-668b-4a39-8503-285e0b51d56d"]

DOMAIN_MODELS_NAME = ["aircraft-manufacturing", "conference-papers", "farming", "college", "zoological-gardens",
                      "registry-of-road-vehicles"]

DOMAIN_DESCRIPTIONS_COUNT = [3, 3, 3, 1, 1, 1]

DOMAIN_TEXTS_COUNT = 12

DOMAIN_PROMPTING_DIRECTORY_PATH = os.path.join(DOMAIN_MODELING_BENCHMARK_DIRECTORY, "evaluation domain models")
PROMPTING_MODEL_NAME = "company employees 4ffd4466-50ec-4d98-b2c1-c3fdba90a65c"