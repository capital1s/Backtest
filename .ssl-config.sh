#!/bin/bash
# SSL Certificate Configuration for Pre-commit Hooks
# This script sets up SSL certificates to prevent verification errors

# Export SSL certificate paths
export SSL_CERT_FILE=$(python3 -m certifi)
export REQUESTS_CA_BUNDLE=$(python3 -m certifi)
export CURL_CA_BUNDLE=$(python3 -m certifi)

# Print SSL configuration
echo "SSL Certificate Configuration:"
echo "SSL_CERT_FILE: $SSL_CERT_FILE"
echo "REQUESTS_CA_BUNDLE: $REQUESTS_CA_BUNDLE"
echo "CURL_CA_BUNDLE: $CURL_CA_BUNDLE"