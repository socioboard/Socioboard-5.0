#!/bin/bash
# make temporary copy of source code
cp -r ./socioboard-api ./docker/socioboard/
cp -r ./socioboard-web-php ./docker/socioboard-web/
cd docker

# pull cached images
#docker pull localhost:5051/sintelli/socioboard:latest
#docker pull localhost:5051/sintelli/socioboard-web:latest

# build without caching
docker build -t sintelli/socioboard ./socioboard
docker build -t sintelli/socioboard-web ./socioboard-web

# build with caching
#docker build --cache-from localhost:5051/sintelli/socioboard:latest -t sintelli/socioboard ./socioboard
#docker build --cache-from localhost:5051/sintelli/socioboard-web:latest -t sintelli/socioboard-web ./socioboard-web
#docker tag sintelli/socioboard:latest localhost:5051/sintelli/socioboard:latest
#docker tag sintelli/socioboard-web:latest localhost:5051/sintelli/socioboard-web:latest
#docker push localhost:5051/sintelli/socioboard:latest
#docker push localhost:5051/sintelli/socioboard-web:latest

# remove temporary copy of source code
rm -rf ./socioboard/socioboard-api ./socioboard-web/socioboard-web-php