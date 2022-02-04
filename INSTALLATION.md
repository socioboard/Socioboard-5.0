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

    1. Requirement check.
        a. Node js ^14 (14 or more)
        b. Npm version ^6 (6 or more)
        c. PM2 version (latest)
        d. Nodemon Latest version (2 or more)
        e. MySQL Creds
        f. Mongo Database Creds
    2. Setting up server environment.
    3. Installing Node Packages in all folders
    4. Setting up MySQL Database
    5. Updating the config files (minimum required should fill with proper details)
    6. Starting the micro-services (User, Feeds, Publish, Update)
    7. Checking the Error Logs



## #1. Requirement Check

    a. To check node installed or not, use `node -v` command in Terminal
        It should give version number. like: v14.15.2
        -- If not Please visit the site(https://nodejs.org/) and download the latest stable version.

    b. To check npm version, use `npm -v`. 
        It should give version number. like: 7.15.1 
        -- It won't work if there's no node version (above one)

    c. To check pm2 installed or not use `pm2 --version`
        It should give version number. like: 5.1.0 
        -- If not Please visit the site(https://pm2.keymetrics.io/) and download the latest stable version.
                    or
            use `npm install pm2 -g` command to install the latest stable version.
    d. To check nodemon version, use `nodemon -v` 
        It should give version number. like: 2.0.13 
        -- If not please use `npm i nodemon -g` to install latest one.
    e. MySQL & Mongo creds are compulsory, so Please follow proper way to install it in local system or use cloud creds.
    

## #2. Set Environment for NODE

## 1. `Open the Terminal in Root Directory (current folder)`

`For windows environment`
```code
    set NODE_ENV=development
```

`For linux || mac environment`
```code
    export NODE_ENV=development
```

## #3. Installing Node Packages in all folders

```code
cd ./socioboard-api/User & npm install & cd ../Feeds & npm install & cd ../Common & npm install & cd ../Update & npm install & cd ../Publish & npm install & cd ../Notification & npm install
```

For Linux
```code
cd socioboard-api/User && npm install && cd ../Feeds && npm install && cd ../Common && npm install && cd ../Update && npm install && cd ../Publish && npm install && cd ../Notification && npm install
```


## #4. Setting up MySQL Database

    A. Setting the config file for Database connections.

        Open the config.json file located at `socioboard-api\Common\Sequelize-cli\config\config.json`

        And Update The below mentioned keys in `development` key
                        "username": "<< DB USER NAME >>",
                        "database": "<< Database name >>",
                        "password": "<< password >>",
                        "host": "127.0.0.1",
        and save the file.

    B. Creating Tables.
         run `set NODE_ENV=development & npx sequelize-cli db:migrate` command in `socioboard-api\Common\Sequelize-cli`

         or Run this command in root directory.

         `cd socioboard-api\Common\Sequelize-cli & npx sequelize-cli db:migrate` 

         It should list all the tables it creating without any errors.

    C. Setting up migrations.
        As you're in the Sequelize-cli folder you can simply run `npx sequelize-cli db:seed --seed 20210303111816-initialize_application_informations.cjs` command. 

        It will add data into single table.

## #5. Updating the config files (minimum required should fill with proper details)
        Most important is we need to setup mongo and mysql objects values properly in all config folders. 

        Ex: in `User` folder `config/development.json` file and fill the << Description >> places with correct files.

```diff       
- Note: In all folders update the configuration files properly.
```

## #6. Generating swagger files in Micro-Services

    Make sure you're in Root directory.

    For Generating swagger file in User micro service you need to go to User folder Then run `npm run swagger` and it should say success.

###### For generating swagger files in all micro-services you need to run the following command

```diff
    cd ./socioboard-api/User & npm run swagger & cd ../Feeds & npm run swagger & cd ../Publish & npm run swagger & cd ../Notification & npm run swagger & cd ../Update & npm run swagger
```

    For Linux
```
    cd ./socioboard-api/User && npm run swagger && cd ../Feeds && npm run swagger && cd ../Publish && npm run swagger && cd ../Notification && npm run swagger && cd ../Update && npm run swagger

```
```diff
+ We should do this in rest 3 micro services as well.
```

## #7. Starting the micro-services

    Make sure you're in Root directory.

    For starting User micro service you need to go to User folder Then run `nodemon user.server.js` and it should start in port 3000(which is configured in `development.json` file)

```diff
+ We should do this in rest 3 micro services as well.
```

### `Note:` If you facing any issue, in that same folder you need to go to resources/Log/ResponseLog folder and check the proper log file to fix it.


### `If you want to run all with pm2`

    Your Terminal should be in Root Directory. then run the below command.

```code
set NODE_ENV=development & cd ./socioboard-api/User & pm2 start user.server.js & cd ../Feeds & pm2 start feeds.server.js & cd ../Publish & pm2 start publish.server.js & cd ../Notification & pm2 start notify.server.js & cd ../Update & pm2 start update.server.js & pm2 status
```

    It will Give you all your services status in a table.


***
<br><br>
<!-- ### All in one command line to setup everything.

```code 
cd ./socioboard-api/User & npm install & cd ../Feeds & npm install & cd ../Common & npm install & cd ../Update & npm install & cd ../Publish & npm install & cd ../Notification & npm install & cd ../Common/Sequelize-cli & set NODE_ENV=development & npx sequelize-cli db:migrate & npx sequelize-cli db:seed --seed 20210303111816-initialize_application_informations.cjs
``` -->

<!-- After setting up everything, -->


## `PHP Installation`
***
## Pre Requirement

`PHP ^8 OR LATEST`

`LARAVEL ^8 OR LATEST`

`COMPOSER ^2 OR LATEST`

`1 PORT OR NGINX OR V-HOST`


## Installation Process

## Open cmd prompt in Main Folder.

## `Check the .env file once carefully`

`For Composer installation & key setup`

    Open the terminal inside `socioboard-web-php` and run the following commands.
    
```code
    composer install & php artisan key:generate
```

```diff
+ Updated the .env file properly to connect the Node services for smooth execution.
```

`For Normal port running process ( port 8000 default )`
```code
    php artisan serve
```


***
 # Video Links
***

## `Installation video links`


## `NODE JS setup videos`

[http://somup.com/crlii70AE7](http://somup.com/crlii70AE7)  Node part-1 -> Till DB configuration.

[http://somup.com/crlijY0Amp](http://somup.com/crlijY0Amp)  Node part-2 -> Till Service start

[http://somup.com/crlijm0AJU](http://somup.com/crlijm0AJU) Node part-3 -> Executed with PM2 as well


## `PHP setup videos`



## `Sample Web usage Videos`
