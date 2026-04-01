#!/bin/bash

echo "Pulling latest code..."
git pull

cd /home/kairavbansal/taskpulse/backend
echo "Stopping old backend..."
pkill -f spring-boot

echo "Starting backend..."
nohup ./mvnw spring-boot:run > app.log 2>&1 &

echo "Backend redeployed successfully!"