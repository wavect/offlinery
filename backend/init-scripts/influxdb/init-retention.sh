#!/bin/bash
set -e

# Install jq if not already present
apt-get update && apt-get install -y jq

# Configuration validation
validate_config() {
    local required_vars=(
        "DOCKER_INFLUXDB_INIT_ADMIN_TOKEN"
        "DOCKER_INFLUXDB_INIT_BUCKET"
        "DOCKER_INFLUXDB_INIT_ORG"
        "DOCKER_INFLUXDB_INIT_RETENTION"
    )

    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            echo "Error: Required environment variable $var is not set"
            exit 1
        fi
    done
}

# Wait for InfluxDB to be ready
wait_for_influxdb() {
    local max_attempts=30
    local attempt=1

    echo "Waiting for InfluxDB to start..."
    while [ $attempt -le $max_attempts ]; do
        if influx ping --host "${INFLUX_HOST}" >/dev/null 2>&1; then
                  echo "InfluxDB is up and ready!"
                  sleep 5
                  return 0
        fi
        echo "Attempt $attempt/$max_attempts: InfluxDB not ready yet..."
        sleep 2
        attempt=$((attempt + 1))
    done

    echo "Error: InfluxDB failed to start after $max_attempts attempts"
    exit 1
}

get_bucket_id() {
    echo "Getting bucket ID for ${DOCKER_INFLUXDB_INIT_BUCKET}..." >&2

    # For InfluxDB 2.x, using explicit output formatting
    local bucket_id
    bucket_id=$(influx bucket list \
        --host "${INFLUX_HOST}" \
        --token "${DOCKER_INFLUXDB_INIT_ADMIN_TOKEN}" \
        --org "${DOCKER_INFLUXDB_INIT_ORG}" \
        --json \
        | jq -r --arg BUCKET "${DOCKER_INFLUXDB_INIT_BUCKET}" \
        '.[] | select(.name == $BUCKET) | .id')

    if [ -z "$bucket_id" ] || [ "$bucket_id" = "null" ]; then
        echo "Error: Could not find bucket ID for ${DOCKER_INFLUXDB_INIT_BUCKET}" >&2
        echo "Available buckets:"
        influx bucket list \
            --host "${INFLUX_HOST}" \
            --token "${DOCKER_INFLUXDB_INIT_ADMIN_TOKEN}" \
            --org "${DOCKER_INFLUXDB_INIT_ORG}" >&2
        exit 1
    fi

    # Verify the bucket ID format and trim any whitespace
    bucket_id=$(echo "$bucket_id" | tr -d '[:space:]')

    echo "Found bucket ID: ${bucket_id}" >&2
    echo -n "$bucket_id"
}

# Create or update bucket
handle_bucket() {
    echo "Checking if bucket exists..."
    if ! influx bucket list --name "${DOCKER_INFLUXDB_INIT_BUCKET}" 2>/dev/null | grep -q "${DOCKER_INFLUXDB_INIT_BUCKET}"; then
        echo "Creating new bucket ${DOCKER_INFLUXDB_INIT_BUCKET}..."
        influx bucket create \
            --name "${DOCKER_INFLUXDB_INIT_BUCKET}" \
            --org "${DOCKER_INFLUXDB_INIT_ORG}" \
            --retention "${DOCKER_INFLUXDB_INIT_RETENTION}"
    else
        echo "Bucket ${DOCKER_INFLUXDB_INIT_BUCKET} already exists, updating retention..."
        set_retention_policy
    fi
}

# Check if config exists and remove it if necessary
handle_existing_config() {
    echo "Checking for existing configs..."
    if influx config list 2>/dev/null | grep -q "default"; then
        echo "Removing existing default config..."
        influx config rm default
    fi

    # Set up new config
    echo "Setting up new config..."
    influx config create -n default \
        -u "${INFLUX_HOST}" \
        -t "${DOCKER_INFLUXDB_INIT_ADMIN_TOKEN}" \
        -o "${DOCKER_INFLUXDB_INIT_ORG}" \
        --active
}

# Set retention policy
set_retention_policy() {
    echo "Setting retention policy to ${DOCKER_INFLUXDB_INIT_RETENTION}..."
    bucket_id=$(get_bucket_id | tr -d '\n\r')

    if ! influx bucket update \
        --host "${INFLUX_HOST}" \
        --token "${DOCKER_INFLUXDB_INIT_ADMIN_TOKEN}" \
        --name "${DOCKER_INFLUXDB_INIT_BUCKET}" \
        --id "${bucket_id}" \
        --retention "${DOCKER_INFLUXDB_INIT_RETENTION}"; then
        echo "Error: Failed to set retention policy"
        exit 1
    fi
}

# Delete old data
delete_old_data() {
    echo "Calculating retention period..."
    current_time=$(date +%s)
    retention_hours=$(echo "${DOCKER_INFLUXDB_INIT_RETENTION}" | sed 's/h$//')
    retention_seconds=$((retention_hours * 3600))
    start_time=$(date -u -d @$((current_time - retention_seconds)) +"%Y-%m-%dT%H:%M:%SZ")

    echo "Deleting data older than ${start_time}..."
    if ! influx delete \
        --host "${INFLUX_HOST}" \
        --token "${DOCKER_INFLUXDB_INIT_ADMIN_TOKEN}" \
        --org "${DOCKER_INFLUXDB_INIT_ORG}" \
        --bucket "${DOCKER_INFLUXDB_INIT_BUCKET}" \
        --start "1970-01-01T00:00:00Z" \
        --stop "${start_time}"; then
        echo "Warning: Failed to delete old data, continuing anyway..."
    fi
}

# Verify setup
verify_setup() {
    echo "Verifying InfluxDB setup..."
    if ! influx bucket list \
        --host "${INFLUX_HOST}" \
        --token "${DOCKER_INFLUXDB_INIT_ADMIN_TOKEN}" \
        --name "${DOCKER_INFLUXDB_INIT_BUCKET}" >/dev/null 2>&1; then
        echo "Error: Failed to verify bucket setup"
        exit 1
    fi
}

# Main execution
main() {
    validate_config
    wait_for_influxdb
    handle_existing_config
    handle_bucket
    set_retention_policy
    delete_old_data
    verify_setup
    echo "InfluxDB initialization completed successfully!"
}

main "$@"