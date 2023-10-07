.PHONY: all
all: deploy

.PHONY: deploy
deploy: clean build serve

.PHONY: build
build:
	docker-compose build

.PHONY: serve
serve:
	docker-compose up -d

.PHONY: clean
clean:
	docker-compose down

.PHONY: local_up
local_up:
	docker-compose -f docker-compose.local.yml up -d
	@echo http://localhost

.PHONY: local_down
local_down:
	docker-compose -f docker-compose.local.yml down
