user = "ken"

server http {
    hosts = ["::"]
    port = 80

    redirect_to_https = true
    acme_challenge {
        root = "letsencrypt/webroot"
    }
}

server https {
    hosts = ["::"]
    port = 443

    tls_cert_file = "letsencrypt/lego/certificates/nsfisis.dev.crt"
    tls_key_file = "letsencrypt/lego/certificates/nsfisis.dev.key"

    proxy default {
        from {
            host = "nsfisis.dev"
        }
        to {
            host = "127.0.0.1"
            port = 8001
        }
    }

    proxy about {
        from {
            host = "about.nsfisis.dev"
        }
        to {
            host = "127.0.0.1"
            port = 8001
        }
    }

    proxy blog {
        from {
            host = "blog.nsfisis.dev"
        }
        to {
            host = "127.0.0.1"
            port = 8001
        }
    }

    proxy slides {
        from {
            host = "slides.nsfisis.dev"
        }
        to {
            host = "127.0.0.1"
            port = 8001
        }
    }

    proxy repos {
        from {
            host = "repos.nsfisis.dev"
        }
        to {
            host = "127.0.0.1"
            port = 8002
        }
    }
}
