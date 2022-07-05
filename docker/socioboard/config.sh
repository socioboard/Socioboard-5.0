# main config
config=$(cat $1)
# facebook
while [[ $(echo $config | jq '.facebook_api') != 'null' ]];do
    config=$(echo $config | jq --arg a "$FACEBOOK_API_APP_ID" '.facebook_api.app_id = $a')
    config=$(echo $config | jq --arg a "$FACEBOOK_API_APP_SECRET" '.facebook_api.secret_key = $a')
    break;
done
# google
while [[ $(echo $config | jq '.google_api') != 'null' ]];do
    config=$(echo $config | jq --arg a "$GOOGLE_API_ID" '.google_api.client_id = $a')
    config=$(echo $config | jq --arg a "$GOOGLE_API_SECRET" '.google_api.client_secrets = $a')
    config=$(echo $config | jq --arg a "$GOOGLE_API_KEY" '.google_api.api_key = $a')
    break;
done
# github
while [[ $(echo $config | jq '.github_api') != 'null' ]];do
    config=$(echo $config | jq --arg a "$GITHUB_API_ID" '.github_api.client_id = $a')
    config=$(echo $config | jq --arg a "$GITHUB_API_SECRET" '.github_api.client_secret = $a')
    break;
done
# twitter
while [[ $(echo $config | jq '.twitter_api') != 'null' ]];do
    config=$(echo $config | jq --arg a "$TWITTER_API_KEY" '.twitter_api.api_key = $a')
    config=$(echo $config | jq --arg a "$TWITTER_API_SECRET" '.twitter_api.secret_key = $a')
    config=$(echo $config | jq --arg a "$TWITTER_API_APP_NAME" '.twitter_api.app_name = $a')
    break;
done
# linkedIn
while [[ $(echo $config | jq '.linkedIn_api') != 'null' ]];do
    config=$(echo $config | jq --arg a "$LINKEDIN_API_ID" '.linkedIn_api.client_id = $a')
    config=$(echo $config | jq --arg a "$LINKEDIN_API_SECRET" '.linkedIn_api.client_secret = $a')
    break;
done
# instagram
while [[ $(echo $config | jq '.instagram_api') != 'null' ]];do
    config=$(echo $config | jq --arg a "$IG_API_ID" '.instagram_api.client_id = $a')
    config=$(echo $config | jq --arg a "$IG_API_SECRET" '.instagram_api.client_secret = $a')
    break;
done
# instagram business
while [[ $(echo $config | jq '.instagram_business_api') != 'null' ]];do
    config=$(echo $config | jq --arg a "$IG_BUSINESS_API_ID" '.instagram_business_api.client_id = $a')
    config=$(echo $config | jq --arg a "$IG_BUSINESS_API_SECRET" '.instagram_business_api.client_secret = $a')
    break;
done
# pinterest
while [[ $(echo $config | jq '.pinterest') != 'null' ]];do
    config=$(echo $config | jq --arg a "$PINTEREST_API_ID" '.pinterest.client_id = $a')
    config=$(echo $config | jq --arg a "$PINTEREST_API_SECRET" '.pinterest.client_secret = $a')
    break;
done
# bit.ly
while [[ $(echo $config | jq '.bitly_api') != 'null' ]];do
    config=$(echo $config | jq --arg a "$BITLY_API_ID" '.bitly_api.client_id = $a')
    config=$(echo $config | jq --arg a "$BITLY_API_SECRET" '.bitly_api.client_secret = $a')
    config=$(echo $config | jq --arg a "$BITLY_REDIRECT_URI" '.bitly_api.redirect_uri = $a')
    config=$(echo $config | jq --arg a "$BITLY_ACCESS_TOKEN" '.bitly_api.access_token = $a')
    break;
done
# tiny link
while [[ $(echo $config | jq '.tiny_link') != 'null' ]];do
    config=$(echo $config | jq --arg a "$TINY_LINK_API_KEY" '.tiny_link.api_key = $a')
    break;
done
# tumblr
while [[ $(echo $config | jq '.tumblr_api') != 'null' ]];do
    config=$(echo $config | jq --arg a "$TUMBLR_API_KEY" '.tumblr_api.OAuth_consumer_Key = $a')
    config=$(echo $config | jq --arg a "$TUMBLR_API_SECRET" '.tumblr_api.OAuth_consumer_secret = $a')
    break;
done
# jest
while [[ $(echo $config | jq '.jest') != 'null' ]];do
    config=$(echo $config | jq --arg a "$JEST_ACCESS_TOKEN" '.jest.access_token = $a')
    break;
done
# mail titles
while [[ $(echo $config | jq '.mailTitles') != 'null' ]];do
    config=$(echo $config | jq --arg a "Activation link" '.mailTitles.activation_link = $a')
    config=$(echo $config | jq --arg a "Invitation from SocioBoard to Add Account" '.mailTitles.Invitation_user = $a')
    config=$(echo $config | jq --arg a "Reset Password" '.mailTitles.forgot_password_request = $a')
    config=$(echo $config | jq --arg a "Payment Invoice" '.mailTitles.payment_invoice = $a')
    break;
done
# mysql
while [[ $(echo $config | jq '.mysql') != 'null' ]];do
    config=$(echo $config | jq --arg a "socioboard-mysql" '.mysql.host = $a')
    config=$(echo $config | jq --arg a "$SQL_DB_USER" '.mysql.username = $a')
    config=$(echo $config | jq --arg a "$SQL_DB_NAME" '.mysql.database = $a')
    config=$(echo $config | jq --arg a "$SQL_DB_PASS" '.mysql.password = $a')
    break;
done
# mongo
while [[ $(echo $config | jq '.mongo') != 'null' ]];do
    config=$(echo $config | jq --arg a "$MONGO_USER" '.mongo.username = $a')
    config=$(echo $config | jq --arg a "$MONGO_PASS" '.mongo.password = $a')
    config=$(echo $config | jq --arg a "socioboard-mongo" '.mongo.host = $a')
    config=$(echo $config | jq --arg a "$MONGO_DB_NAME" '.mongo.db_name = $a')
    break;
done
# auth
while [[ $(echo $config | jq '.authorize') != 'null' ]];do
    config=$(echo $config | jq --arg a "$AUTH_SECRET" '.authorize.secret = $a')
    config=$(echo $config | jq --arg a "$AUTH_TOKEN_SECRET" '.authorize.token_secret = $a')
    break;
done
# mail
while [[ $(echo $config | jq '.mailService') != 'null' ]];do
    config=$(echo $config | jq --arg a "$MAIL_HANDLER" '.mailService.defaultMailOption = $a')
    config=$(echo $config | jq --arg a "$SENDGRID_USERNAME" '.mailService.sendgrid.username = $a')
    config=$(echo $config | jq --arg a "$SENDGRID_PASSWORD" '.mailService.sendgrid.password = $a')
    config=$(echo $config | jq --arg a "$SENDGRID_FROM_MAIL" '.mailService.sendgrid.frommail = $a')
    config=$(echo $config | jq --arg a "$SENDGRID_CC_ADDR" '.mailService.sendgrid.ccmail = $a')
    config=$(echo $config | jq --arg a "$SENDGRID_API_KEY" '.mailService.sendgrid.apiKey = $a')
    config=$(echo $config | jq --arg a "$GOOGLE_EMAIL" '.mailService.gmailServices.email = $a')
    config=$(echo $config | jq --arg a "$GOOGLE_EMAIL_PASSWORD" '.mailService.gmailServices.password = $a')
    break;
done
# socioboard twitter
while [[ $(echo $config | jq '.socioboardTwitterhandler') != 'null' ]];do
    config=$(echo $config | jq --arg a "$SOCIOBOARD_TWITTER_HANDLER" '.socioboardTwitterhandler = $a')
    break;
done
# aMember
while [[ $(echo $config | jq '.aMember') != 'null' ]];do
    config=$(echo $config | jq --arg a "$AMEMBER_KEY" '.aMember.key = $a')
    config=$(echo $config | jq --arg a "$AMEMBER_DOMAIN" '.aMember.domain = $a')
    break;
done
while [[ $(echo $config | jq '.aMember_enabled') != 'null' ]];do
    config=$(echo $config | jq --arg a "$AMEMBER_ENABLED" '.aMember_enabled = $a')
    break;
done
# twilio
while [[ $(echo $config | jq '.twilio') != 'null' ]];do
    config=$(echo $config | jq --arg a "$TWILIO_ACC_SID" '.twilio.account_sid = $a')
    config=$(echo $config | jq --arg a "$TWILIO_AUTH_KEY" '.twilio.auth_key = $a')
    config=$(echo $config | jq --arg a "$TWILIO_SERVICE_ID" '.twilio.service_id = $a')
    break;
done

# user config specific additions
while [[ $1 == "/usr/socioboard/app/socioboard-api/User/config/development.json" ]];do
    config=$(echo $config | jq '. += { "base_path": "../../media" }')
    config=$(echo $config | jq '. += { "payment_path": "../../media/payments" }')
    config=$(echo $config | jq '. += { "template": "public/template/paymentTemplate.html" }')
    break;
done

# replace old config with new config
rm -f $1
echo $config > $1

# replace localhost with env domain
sed -i "s;local.socioboard.com;$DOMAIN;g" $1
sed -i "s;localhost;$DOMAIN;g" $1
sed -i "s;notifyv5.socioboard.com;$DOMAIN:3004;g" $1