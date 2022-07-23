FROM node:lts-alpine3.15
LABEL maintainer="vaughngx4 (vaughng@pm.me)"
WORKDIR /
RUN mkdir -p /usr/socioboard/app
RUN apk add --no-cache --upgrade \
    openssl \
    ca-certificates \
    su-exec \
    bash \
    jq \
    apache2 \
    apache2-utils \
    php8 \
    php8-session \
    php8-dom \
    php8-tokenizer \
    php8-fileinfo \
    php8-apache2 \
    php8-mysqli \
    php8-opcache \
    php8-common \
    php8-cli \
    php8-curl \
    php8-xml \
    php8-xmlwriter \
    composer
WORKDIR /usr/socioboard/app
COPY ./socioboard-api/ ./socioboard-api
COPY ./socioboard-web-php/ ./socioboard-web-php
RUN cd /usr/socioboard/app/socioboard-api/User && npm install && \
    cd ../Feeds && npm install && \
    cd ../Common && npm install && \
    cd ../Update && npm install && \
    cd ../Publish && npm install && \
    cd ../Notification && npm install && \
    cd ../Admin && npm install
RUN cd ./socioboard-web-php && composer install
RUN chown -R node /usr/socioboard/app
COPY ./sql-ping.php /sql-ping.php
COPY ./entrypoint.sh /docker-entrypoint.sh
COPY ./init.sh /init.sh
COPY ./config.sh /config.sh
ENTRYPOINT ["/docker-entrypoint.sh"]
