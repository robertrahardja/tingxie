#!/bin/bash

# Create lessons 3-10
for i in {3..10}; do
  cp koushi25-lesson1.html koushi25-lesson${i}.html
  echo "Created koushi25-lesson${i}.html"
done

echo "All lesson files created!"