user = "ken"

server http {
    host = "0.0.0.0"
    port = 80

    redirect_to_https = true
    acme_challenge {
        root = "letsencrypt/webroot"
    }
}

server https {
    host = "0.0.0.0"
    port = 443

    tls_cert_file = "letsencrypt/lego/certificates/nsfisis.dev.crt"
    tls_key_file = "letsencrypt/lego/certificates/nsfisis.dev.key"

    proxy blog {
        from {
            host = "blog.nsfisis.dev"
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
