#!/bin/sh
set -e

SERVER="${NATS_SERVER}"
STREAM="${NATS_STREAM_NAME}"
SUBJECTS="${NATS_SUBJECTS}"

echo "Setting up NATS stream '${STREAM}' for subjects '${SUBJECTS}'..."

for i in $(seq 1 35); do
  if nats server check --server "${SERVER}" > /dev/null 2>&1; then
    break
  fi
  echo "Waiting for NATS server..."
  sleep 1
done

if nats stream info "${STREAM}" --server "${SERVER}" > /dev/null 2>&1; then
  echo "Stream '${STREAM}' already exists."
  exit 0
fi

# создаём стрим
nats stream add "${STREAM}" \
  --subjects "${SUBJECTS}" \
  --ack \
  --max-msgs=-1 \
  --max-bytes=-1 \
  --storage=file \
  --retention=limits \
  --discard=old \
  --server "${SERVER}" \
  --yes

echo "Stream '${STREAM}' created successfully."