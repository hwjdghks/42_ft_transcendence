FILE_PATH=./srcs/docker-compose.yml
VOLUME_PATH=$(PWD)/media/profile_images

.PHONY: all
all:
	@make up

.PHONY: up
up:
	@test -d $(VOLUME_PATH) || mkdir -p $(VOLUME_PATH)
	docker compose -f $(FILE_PATH) up --build -d

.PHONY: down
down:
	docker compose -f $(FILE_PATH) down

.PHONY: clean
clean: down
	rm -rf $(VOLUME_PATH)
	docker compose -f $(FILE_PATH) down --rmi all --volumes
	docker system prune -f