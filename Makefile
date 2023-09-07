.PHONY: all
all: deploy

.PHONY: deploy
deploy: build serve

.PHONY: setup
setup: .nsfisis_dev_shared_network certbot
	cd vhosts/blog; make setup

.PHONY: build
build:
	docker-compose build
	cd vhosts/blog; make build

.PHONY: serve
serve: .nsfisis_dev_shared_network
	docker-compose up -d
	cd vhosts/blog; make serve

.PHONY: clean
clean:
	cd vhosts/blog; make clean
	docker-compose down
	docker network ls | grep nsfisis_dev_shared > /dev/null && docker network rm nsfisis_dev_shared

.PHONY: .nsfisis_dev_shared_network
.nsfisis_dev_shared_network:
	docker network ls | grep nsfisis_dev_shared > /dev/null || docker network create nsfisis_dev_shared

.PHONY: certbot
certbot:
	docker-compose run --rm --entrypoint 'certbot certonly --register-unsafely-without-email --webroot -w /var/letsencrypt/www -d nsfisis.dev,blog.nsfisis.dev,www.nsfisis.dev' certbot
