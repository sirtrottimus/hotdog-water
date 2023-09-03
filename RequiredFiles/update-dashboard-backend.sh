#!/bin/bash

# Replace these variables with your actual values
IMAGE_NAME="hatbot-backend:latest"
CONTAINER_NAME="hatbot-backend-prod"

# Stop and remove the existing container
if [ $(docker ps -a -f name=$CONTAINER_NAME | grep -w $CONTAINER_NAME | wc -l) -eq 1 ]; then
    echo "Stopping and removing existing container..."
    docker stop $CONTAINER_NAME
    docker rm $CONTAINER_NAME
fi



cd /home/sammy/hatbot
# Build the Docker image with the updated code
docker build -t $IMAGE_NAME . -f Dockerfile --no-cache

# Run the new container
docker run  -p 3002:3002 --name $CONTAINER_NAME  -e NODE_ENV="production" -e PORT="3002" -e PROD_DISCORD_CLIENT_ID="" -e PROD_DISCORD_CLIENT_SECRET="" -e PROD_DISCORD_SERVER_URL="https://api.hatfilms.co.uk" -e PROD_DISCORD_CLIENT_URL="https://dashboard.hatfilms.co.uk" -e MONGO_URI="" -e SESSION_SECRET="" -e DEBUG="false" -d $IMAGE_NAME
