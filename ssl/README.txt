Place your self-signed certificates here:
- server.crt
- server.key

Generate with:
openssl req -x509 -newkey rsa:4096 -keyout server.key -out server.crt -days 365 -nodes -subj "/CN=localhost"

To enable HTTPS in production:
1. Place your SSL certificate and key in the ssl/ directory:
   - ssl/server.crt
   - ssl/server.key
2. Re-run bash deploy-production.sh
3. The backend will automatically detect and enable HTTPS.

Generate a self-signed certificate for testing:
openssl req -x509 -newkey rsa:4096 -keyout ssl/server.key -out ssl/server.crt -days 365 -nodes -subj "/CN=localhost"

For production, use certificates from a trusted CA.
