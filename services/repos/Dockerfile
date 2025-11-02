ARG BASE_DEBIAN_VERSION=trixie
ARG APACHE_HTTPD_VERSION=2.4.65
# NOTE: Use the master branch because the latest release is 6 years ago.
ARG CGIT_VERSION=master


################################################
FROM debian:$BASE_DEBIAN_VERSION-slim AS builder
################################################

ARG CGIT_VERSION

RUN apt-get update && \
    apt-get install -y \
        build-essential \
        curl \
        git \
        libssl-dev \
        zlib1g-dev

RUN git clone --branch $CGIT_VERSION https://git.zx2c4.com/cgit /cgit

WORKDIR /cgit

RUN --mount=type=bind,source=./cgit.conf,target=./cgit.conf \
    make get-git && \
    make NO_LUA=1 && \
    make install


#####################################################
FROM httpd:$APACHE_HTTPD_VERSION-$BASE_DEBIAN_VERSION
#####################################################

COPY --from=builder /var/www/htdocs/cgit/ /usr/local/apache2/htdocs/cgit

RUN apt-get update && \
    apt-get install -y \
        zstd && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

RUN sed -i \
        -e 's/^\(\s*\)#\(LoadModule .*mod_cgid.so\)/\1\2/' \
        -e 's/^\(\s*\)#\(LoadModule .*mod_cgi.so\)/\1\2/' \
        /usr/local/apache2/conf/httpd.conf && \
    echo 'Include conf/extra/httpd-cgit.conf' >> /usr/local/apache2/conf/httpd.conf

RUN ln -s /usr/local/apache2/conf/mime.types /etc/mime.types && \
    mkdir -p /var/cache/cgit && \
    chown -R www-data:www-data /var/cache/cgit
