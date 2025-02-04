FROM python:3.11 AS builder

WORKDIR /app

COPY conf/requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

FROM python:3.11-slim

RUN apt-get update && \
    apt-get install -y --no-install-recommends libpq-dev && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=builder /install/lib/python3.11/site-packages/ /usr/local/lib/python3.11/site-packages/
COPY --from=builder /install/bin/gunicorn /usr/local/bin/
COPY srcs/ .
COPY tools/script.sh entrypoint.sh

ENTRYPOINT ["./entrypoint.sh"]

# CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]

CMD ["gunicorn", "backend.wsgi:application", "--bind", "0.0.0.0:8000"]
