.PHONY: all
all: deploy

.PHONY: deploy
deploy: clean build serve

.PHONY: build
build:
	docker compose build
	make clone-repos fetch-repos

.PHONY: serve
serve:
	docker compose up -d

.PHONY: clean
clean:
	docker compose down

.PHONY: make-repo-list
make-repo-list:
	scripts/make-repo-list.sh

.PHONY: clone-repos
clone-repos:
	scripts/clone-repos.sh

.PHONY: fetch-repos
fetch-repos:
	scripts/fetch-repos.sh
