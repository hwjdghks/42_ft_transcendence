FILE_PATH=./srcs/docker-compose.yml

.PHONY: all
all:
	@make up

.PHONY: up
up:
	docker compose -f $(FILE_PATH) up --build -d

.PHONY: down
down:
	docker compose -f $(FILE_PATH) down

.PHONY: clean
clean: down
	docker volume prune -f
	docker system prune -a -f
