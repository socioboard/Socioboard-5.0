# SSL Certificates
NGINX is expecting `cert.pem` and `key.pem` in this directory.

These can be either:

1) A wildcard cert key pair for your base domain

OR

2) A certificate containing SAN for domains as follows:
- socio.mydomian.example
- socio-api.mydomain.example
- socio-feeds.mydomain.example
- socio-publish.mydomain.example
- socio-update.mydomain.example
- socio-notifications.mydomain.example

with `mydomian.example` being your base domain.

If `cert.pem` is not found, the container will create a self-signed wildcard cert-key pair for your specified base domain and overwrite `key.pem` if the file exists.
