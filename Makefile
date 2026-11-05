COMPOSE = docker compose

.PHONY: all build up clean fclean re

all: up

build:
	$(COMPOSE) build

up: build
	$(COMPOSE) up -d
log:
	$(COMPOSE) logs -f

clean:
	$(COMPOSE) down --remove-orphans

fclean:
	$(COMPOSE) down --rmi all --volumes --remove-orphans

re: fclean all