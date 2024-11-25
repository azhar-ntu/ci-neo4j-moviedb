#!/bin/bash

# Configuration
USERNAME="azharntu"
VERSION="latest"
BACKEND_IMAGE="in6299-ci-neo4j-moviedb-backend"
FRONTEND_IMAGE="in6299-ci-neo4j-moviedb-frontend"

# Function to build and push an image
build_and_push() {
    local service=$1
    local image_name=$2
    local version=$3
    
    echo "Building $service image..."
    docker build -t $USERNAME/$image_name:latest ./$service
    docker tag $USERNAME/$image_name:latest $USERNAME/$image_name:$version
    
    echo "Pushing $service images..."
    docker push $USERNAME/$image_name:latest
}

# Login to Docker Hub
echo "Logging in to Docker Hub..."
docker login

# Build and push Backend
build_and_push "Backend" $BACKEND_IMAGE $VERSION

# Build and push Frontend
build_and_push "Frontend" $FRONTEND_IMAGE $VERSION

echo "All images have been built and pushed successfully!"