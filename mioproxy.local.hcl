user = "ken"

server http {
    host = "127.0.0.1"
    port = 8000

    proxy blog {
        from {
            host = "blog.localhost"
        }
        to {
            host = "127.0.0.1"
            port = 8001
        }
    }
}
