.PHONY: all
all: deploy

.PHONY: deploy
deploy: clean build serve

.PHONY: provision
provision:
	sudo sh provisioning/run.sh

.PHONY: build
build:
	cd services/blog; make build

.PHONY: serve
serve:
	sudo systemctl start mioproxy
	cd services/blog; make serve

.PHONY: clean
clean:
	cd services/blog; make clean
	sudo systemctl stop mioproxy
