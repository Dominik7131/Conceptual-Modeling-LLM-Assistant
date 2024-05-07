#!/bin/bash
set -euo pipefail


# Generate entities
start=$(date +%s.%N)
python tests/suggestions_generator.py --user_choice entities
end_entities=$(date +%s.%N)

execution_time_entities=$(echo "$end_entities - $start" | bc)
echo "Entities execution time: $execution_time_entities seconds"


# Generate attributes
start_attributes=$(date +%s.%N)
python tests/suggestions_generator.py --user_choice attributes
end_attributes=$(date +%s.%N)

execution_time_attributes=$(echo "$end_attributes - $start_attributes" | bc)
echo "Attributes execution time: $execution_time_attributes seconds"


# Generate relationships
start_relationships=$(date +%s.%N)
python tests/suggestions_generator.py --user_choice relationships
end_relationships=$(date +%s.%N)

execution_time_relationships=$(echo "$end_relationships - $start_relationships" | bc)
echo "Relationships execution time: $execution_time_relationships seconds"

# Generate PlantUML diagrams for the generated results
python plantUML_generator.py

execution_time_total=$(echo "$end_relationships - $start" | bc)
echo "Total execution time: $execution_time_total seconds"
