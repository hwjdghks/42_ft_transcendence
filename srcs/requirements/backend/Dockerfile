FROM python:3.11

WORKDIR /app

# requirements.txt를 컨테이너로 복사
COPY conf/requirements.txt /app/

# 패키지 설치
RUN pip install --no-cache-dir -r /app/requirements.txt

COPY srcs/ /app/

# RUN python manage.py collectstatic --noinput

COPY tools/script.sh /app/entrypoint.sh

ENTRYPOINT ["/app/entrypoint.sh"]

# CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]

CMD ["gunicorn", "backend.wsgi:application", "--bind", "0.0.0.0:8000"]
