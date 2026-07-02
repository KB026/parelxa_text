#!/bin/bash
# Concurrent Load Test Script

URL="http://localhost:3000/"
REQUESTS=50
CONCURRENCY=10

echo "Starting load test against $URL with $CONCURRENCY concurrent agents..."
seq 1 $REQUESTS | xargs -n 1 -P $CONCURRENCY -I {} curl -s -o /dev/null -w "Agent Response: HTTP %{http_code}\n" $URL
echo "Load test complete."
