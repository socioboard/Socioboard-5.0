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

### To Install Node packages Please run the below command.

```diff
    cd ./socioboard-api/User; npm install; cd ../Feeds; npm install; cd ../Common ; npm install; cd ../Update; npm install; cd ../Publish; npm install; cd ../Notification; npm install; cd ..
```

### `OR you can use the following command`

```diff
    cd ./socioboard-api/User && npm install && cd ../Feeds && npm install && cd ../Common  && npm install && cd ../Update && npm install && cd ../Publish && npm install && cd ../Notification && npm install && cd ..
```

## Update Your Config files


***

## `Laravel Setup (Front-End)`

### Required Composer 2.*

### To install Latest Composer Please follow the steps

    1. sudo apt-get install curl
    2. sudo curl -s https://getcomposer.org/installer | php
    3. sudo mv composer.phar /usr/local/bin/composer
    4. Finally check the composer using running `composer`

        If not Latest or more than 2, I highly recommend you to install latest version, if you seeing it too gap then at least 2nd version is required.

***

    sudo apt-get install php8.0-curl  // If you facing curl-issue (this is only for 8.0)
    sudo apt-get update & sudo apt install php-xml - for (Install or enable PHP's dom extension.) Error

***


## `Then Composer Installation.`

```code    
    composer install
```

