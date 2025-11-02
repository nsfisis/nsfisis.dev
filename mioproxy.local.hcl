user = "ken"

server http {
    host = "127.0.0.1"
    port = 8000

    proxy default {
        from {
            host = "localhost:8000"
        }
        to {
            host = "127.0.0.1"
            port = 8001
        }
    }

    proxy about {
        from {
            host = "about.localhost:8000"
        }
        to {
            host = "127.0.0.1"
            port = 8001
        }
    }

    proxy blog {
        from {
            host = "blog.localhost:8000"
        }
        to {
            host = "127.0.0.1"
            port = 8001
        }
    }

    proxy slides {
        from {
            host = "slides.localhost:8000"
        }
        to {
            host = "127.0.0.1"
            port = 8001
        }
    }
}
