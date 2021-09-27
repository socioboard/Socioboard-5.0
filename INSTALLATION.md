## `NODE micro services setup :system:`


***

## Pre Requirement

`NODE ^14 OR LATEST`

`NPM ^7 OR LATEST`

`NODEMON ^2 OR LATEST`

`MIN 5 FREE PORTS`

`PM2 – FOR AUTOMATION & EASY MANAGEMENT`

`Mongo Database`

`MySQL Database`

`5 free ports`

## Installation Process

## Open cmd prompt in Main Folder.


## Set Environment for NODE

## 1. `Open the Terminal in Root Directory (current folder)`

`For windows environment`
```code
    set NODE_ENV=development
```

`For linux || mac environment`
```code
    export NODE_ENV=development
```

### For installing packages in all Micro services.

```code
cd ./socioboard-api/User & npm install & cd ../Feeds & npm install & cd ../Common & npm install & cd ../Update & npm install & cd ../Publish & npm install & cd ../Notification & npm install
```

### All in one command line to setup everything.

```code 
cd ./socioboard-api/User & npm install & cd ../Feeds & npm install & cd ../Common & npm install & cd ../Update & npm install & cd ../Publish & npm install & cd ../Notification & npm install & cd ../Common/Sequelize-cli & set NODE_ENV=development & npx sequelize-cli db:migrate & npx sequelize-cli db:seed --seed 20210303111816-initialize_application_informations.cjs
```

<!-- After setting up everything, -->

## Once everything is initialized properly

## `start your Services`

```code
npm i pm2 -g & set NODE_ENV=development & cd ./socioboard-api/User & pm2 user.service.js & cd ../Feeds & pm2 feeds.service.js & ../Publish & pm2 publish.service.js & cd ../Notification & pm2 notify.service.js & cd ../Update & pm2 update.service.js & pm2 status
```

---
---
## `PHP Installation`
***
## Pre Requirement

`PHP ^8 OR LATEST`

`LARAVEL ^8 OR LATEST`

`COMPOSER ^2 OR LATEST`

`1 PORT OR NGINX OR V-HOST`


## Installation Process

## Open cmd prompt in Main Folder.

## `Check the env once carefully`

`For Composer installation & key setup`
```code
    composer install & php artisan key:generate
```

`For Normal port running process ( port 8000 default )`
```code
    php artisan serve
```