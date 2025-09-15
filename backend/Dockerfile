FROM python:3.9

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Remove mandatory COPY for SSL certs to avoid build failure if not present
# To enable HTTPS, mount ssl/server.crt and ssl/server.key at runtime or use a multi-stage build for certs
# COPY ssl/server.crt /app/server.crt
# COPY ssl/server.key /app/server.key

CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
# To enable HTTPS, add --ssl-keyfile and --ssl-certfile options if certs are present