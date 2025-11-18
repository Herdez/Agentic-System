#!/bin/bash

# Script de construcción para Docker

echo "🐳 Construyendo imagen Docker..."

# Nombre de la imagen
IMAGE_NAME="blockchain-defense-system"
TAG=${1:-latest}

# Construir imagen
echo "📦 Construyendo imagen: $IMAGE_NAME:$TAG"
docker build -t $IMAGE_NAME:$TAG .

# Verificar construcción
if [ $? -eq 0 ]; then
    echo "✅ Imagen construida exitosamente!"
    
    # Mostrar tamaño de la imagen
    docker images $IMAGE_NAME:$TAG
    
    # Preguntar si quiere ejecutar
    read -p "¿Quieres ejecutar la imagen? (y/N): " run_image
    if [[ $run_image == [Yy]* ]]; then
        echo "🚀 Ejecutando contenedor..."
        docker run -p 5000:5000 --name blockchain-defense $IMAGE_NAME:$TAG
    fi
    
    # Preguntar si quiere subir a Docker Hub
    read -p "¿Quieres subir a Docker Hub? (y/N): " push_image
    if [[ $push_image == [Yy]* ]]; then
        read -p "Username de Docker Hub: " docker_username
        docker tag $IMAGE_NAME:$TAG $docker_username/$IMAGE_NAME:$TAG
        docker push $docker_username/$IMAGE_NAME:$TAG
        echo "✅ Imagen subida a Docker Hub!"
    fi
else
    echo "❌ Error construyendo la imagen"
    exit 1
fi
