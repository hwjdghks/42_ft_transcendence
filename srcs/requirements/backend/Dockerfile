FROM python:3.11 AS builder

WORKDIR /app

COPY conf/requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

RUN apt-get update && \
    apt-get install -y --no-install-recommends openssl && \
    rm -rf /var/lib/apt/lists/*

RUN mkdir -p /etc/ssl/certs /etc/ssl/private && \
    openssl req -x509 -nodes -days 365 \
    -newkey rsa:2048 \
    -keyout /etc/ssl/private/backend.key \
    -out /etc/ssl/certs/backend.crt \
    -subj "/C=KR/ST=Seoul/L=Seoul/O=42_transendence/OU=backend/CN=localhost"

FROM python:3.11-slim

RUN apt-get update && \
    apt-get install -y --no-install-recommends libpq-dev && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=builder /install/lib/python3.11/site-packages/ /usr/local/lib/python3.11/site-packages/
COPY --from=builder /install/bin/gunicorn /usr/local/bin/
COPY --from=builder /etc/ssl/certs/backend.crt /etc/ssl/certs/cert.pem
COPY --from=builder /etc/ssl/private/backend.key /etc/ssl/private/key.pem
COPY srcs/ .
COPY tools/script.sh entrypoint.sh

ENTRYPOINT ["./entrypoint.sh"]

# CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]

CMD ["gunicorn", "backend.wsgi:application", "--bind", "backend:8000", "--certfile", "/etc/ssl/certs/cert.pem", "--keyfile", "/etc/ssl/private/key.pem"]