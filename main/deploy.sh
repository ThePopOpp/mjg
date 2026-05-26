#!/bin/bash
# Deploy all pages to blueprint.michaeljgauthier.com
# Run from Cursor terminal: bash deploy.sh

set -e

HOST="root@85.31.224.66"
CONTAINER="blueprint-landing"

echo "Preparing remote directory..."
ssh -o StrictHostKeyChecking=no "$HOST" "mkdir -p /tmp/blueprint"

echo "Copying files to server..."
scp -o StrictHostKeyChecking=no \
  index.html \
  about-us.html \
  our-mission \
  contact.html \
  resources.html \
  post.html \
  nginx.conf \
  Dockerfile \
  "$HOST:/tmp/blueprint/"

echo "Rebuilding and starting container..."
ssh -o StrictHostKeyChecking=no "$HOST" "
  cd /tmp/blueprint && \
  docker build -t blueprint-landing . && \
  docker stop $CONTAINER 2>/dev/null || true && \
  docker rm $CONTAINER 2>/dev/null || true && \
  docker run -d \
    --name $CONTAINER \
    --network coolify \
    --restart unless-stopped \
    --label 'traefik.enable=true' \
    --label 'traefik.http.routers.blueprint.rule=Host(\`blueprint.michaeljgauthier.com\`)' \
    --label 'traefik.http.routers.blueprint.entrypoints=http' \
    --label 'traefik.http.routers.blueprint.middlewares=redirect-to-https' \
    --label 'traefik.http.routers.blueprint-secure.rule=Host(\`blueprint.michaeljgauthier.com\`)' \
    --label 'traefik.http.routers.blueprint-secure.entrypoints=https' \
    --label 'traefik.http.routers.blueprint-secure.tls=true' \
    --label 'traefik.http.routers.blueprint-secure.tls.certresolver=letsencrypt' \
    --label 'traefik.http.services.blueprint.loadbalancer.server.port=80' \
    blueprint-landing
"
echo "Done — https://blueprint.michaeljgauthier.com"
