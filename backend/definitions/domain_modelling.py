import os

DOMAIN_MODELING_BENCHMARK_DIRECTORY = "domain-modeling-benchmark"
DOMAIN_MODELING_DIRECTORY_PATH = os.path.join(DOMAIN_MODELING_BENCHMARK_DIRECTORY, "manual evaluation domains")

DOMAIN_MODELS = ["aircraft manufacturing", "conference papers", "farming", "college", "zoological gardens", "registry of road vehicles"]

DOMAIN_DESCRIPTIONS_COUNT = [3, 3, 3, 1, 1, 1]

DOMAIN_TEXTS_COUNT = 12

DOMAIN_PROMPTING_DIRECTORY_PATH = os.path.join(DOMAIN_MODELING_BENCHMARK_DIRECTORY, "prompting domains")
PROMPTING_MODEL = "company employees"
