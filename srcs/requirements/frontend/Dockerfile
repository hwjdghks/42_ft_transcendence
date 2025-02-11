FROM nginx:1.26-alpine

RUN apk add --no-cache openssl

RUN mkdir -p /etc/nginx/ssl

RUN openssl req -x509 -nodes -days 365 \
  -newkey rsa:2048 \
  -keyout /etc/nginx/ssl/nginx.key \
  -out /etc/nginx/ssl/nginx.crt \
  -subj "/C=KR/ST=Seoul/L=Seoul/O=42_transendence/CN=localhost"
