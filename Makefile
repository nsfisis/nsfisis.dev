.PHONY: all
all: deploy

.PHONY: deploy
deploy: clean build serve

.PHONY: provision
provision:
	sudo sh provisioning/run.sh

.PHONY: build
build:
	cd services/nuldoc; make build
	cd services/repos; make build

.PHONY: serve
serve:
	sudo systemctl start mioproxy
	cd services/nuldoc; make serve
	cd services/repos; make serve

.PHONY: clean
clean:
	cd services/repos; make clean
	cd services/nuldoc; make clean
	sudo systemctl stop mioproxy
