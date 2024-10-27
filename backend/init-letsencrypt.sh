#!/bin/bash

# Exit on error
set -e

# Parameters
DOMAIN="api.offlinery.io"
EMAIL="office@offlinery.io"
RSA_KEY_SIZE=4096
DATA_PATH="./certbot"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}### Starting SSL certificate setup...${NC}"

# Ensure script is run as root or with sudo
if [ "$EUID" -ne 0 ]; then
    echo "Please run as root or with sudo"
    exit 1
fi

# Check if certificates already exist
CERT_PATH="$DATA_PATH/conf/live/$DOMAIN"
if [ -d "$CERT_PATH" ]; then
    echo -e "${YELLOW}Certificate directory already exists at $CERT_PATH${NC}"
    echo "Options:"
    echo "1. Backup and create new certificates"
    echo "2. Skip certificate creation and just restart services"
    echo "3. Delete existing certificates and create new ones"
    echo "4. Exit"
    read -p "Choose an option (1-4): " choice

    case $choice in
        1)
            echo "Creating backup..."
            BACKUP_DIR="$DATA_PATH/conf/backup-$(date +%Y%m%d-%H%M%S)"
            mkdir -p "$BACKUP_DIR"
            cp -r "$CERT_PATH" "$BACKUP_DIR/"
            echo "Backup created at $BACKUP_DIR"
            rm -rf "$CERT_PATH"
            ;;
        2)
            echo "Skipping certificate creation..."
            docker compose up -d
            echo -e "${GREEN}Services restarted!${NC}"
            exit 0
            ;;
        3)
            echo "Deleting existing certificates..."
            rm -rf "$CERT_PATH"
            ;;
        4)
            echo "Exiting..."
            exit 0
            ;;
        *)
            echo -e "${RED}Invalid option${NC}"
            exit 1
            ;;
    esac
fi

# Check if domain resolves to the current server
SERVER_IP=$(curl -s http://metadata.google.internal/computeMetadata/v1/instance/network-interfaces/0/access-configs/0/external-ip -H "Metadata-Flavor: Google")
DOMAIN_IP=$(dig +short $DOMAIN)

echo -e "${YELLOW}Server IP: $SERVER_IP${NC}"
echo -e "${YELLOW}Domain IP: $DOMAIN_IP${NC}"

if [ "$SERVER_IP" != "$DOMAIN_IP" ]; then
    echo -e "${YELLOW}Warning: $DOMAIN does not resolve to this server's IP ($SERVER_IP)${NC} (if you use a Cloudflare Proxy you might be fine!)"
    echo "Please ensure your DNS settings are correct before continuing"
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Create required directories with proper permissions
echo "### Setting up directories..."
mkdir -p "$DATA_PATH/conf/live/$DOMAIN"
mkdir -p "$DATA_PATH/www"
chmod -R 755 "$DATA_PATH"

# Stop any running containers
echo "### Stopping existing containers..."
docker compose -f docker-compose.prod.yml down

# Create Docker network if it doesn't exist
# docker network create app_network 2>/dev/null || true

# Create temporary certificate
echo "### Creating temporary certificate..."
docker compose -f docker-compose.prod.yml run --rm --entrypoint "\
    sh -c 'mkdir -p /etc/letsencrypt/live/$DOMAIN && \
    openssl req -x509 -nodes -newkey rsa:$RSA_KEY_SIZE -days 1 \
        -keyout \"/etc/letsencrypt/live/$DOMAIN/privkey.pem\" \
        -out \"/etc/letsencrypt/live/$DOMAIN/fullchain.pem\" \
        -subj \"/CN=$DOMAIN\"'" certbot

# Start nginx
echo "### Starting nginx..."
docker compose -f docker-compose.prod.yml up -d nginx

# Wait for nginx to start
echo "### Waiting for nginx to start..."
sleep 5

# Test nginx configuration
echo "### Testing nginx configuration..."
docker compose -f docker-compose.prod.yml exec nginx nginx -t

# Request Let's Encrypt certificate
echo "### Requesting Let's Encrypt certificate..."
docker compose -f docker-compose.prod.yml run --rm --entrypoint "\
    certbot certonly --webroot -w /var/www/certbot \
        --email $EMAIL \
        -d $DOMAIN \
        --rsa-key-size $RSA_KEY_SIZE \
        --agree-tos \
        --force-renewal \
        --non-interactive" certbot

# Reload nginx to use the new certificate
echo "### Reloading nginx..."
docker compose -f docker-compose.prod.yml exec nginx nginx -s reload

# Start all services
echo "### Starting all services..."
docker compose -f docker-compose.prod.yml up -d

echo -e "${GREEN}### Certificate setup completed!${NC}"
echo -e "${YELLOW}Please check the following:${NC}"
echo "1. Verify that https://$DOMAIN is accessible"
echo "2. Check certificate validity with: curl -vI https://$DOMAIN"
echo "3. Certificates are stored in: $DATA_PATH/conf/live/$DOMAIN/"