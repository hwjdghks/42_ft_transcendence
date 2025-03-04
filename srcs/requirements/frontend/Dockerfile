FROM nginx:1.26-alpine

RUN apk add --no-cache openssl

RUN mkdir -p /etc/nginx/ssl

RUN mkdir -p /etc/ssl/certs /etc/ssl/private && \
  openssl req -x509 -nodes -days 365 \
  -newkey rsa:2048 \
  -keyout /etc/ssl/private/nginx.key \
  -out /etc/ssl/certs/nginx.crt \
  -subj "/C=KR/ST=Seoul/L=Seoul/O=42_transendence/OU=frontend/CN=localhost"

COPY srcs /usr/share/nginx/html
COPY conf/nginx.conf /etc/nginx/conf.d/default.conf
