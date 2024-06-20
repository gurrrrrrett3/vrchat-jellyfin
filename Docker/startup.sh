#/bin/bash
#get enviroment values from docker and place into .env file
echo "JELLYFIN_HOST=$JELLYFIN_HOST" > /vrchat-jellyfin/.env
echo "JELLYFIN_USERNAME=$JELLYFIN_USERNAME" >> /vrchat-jellyfin/.env
echo "JELLYFIN_PASSWORD=$JELLYFIN_PASSWORD" >> /vrchat-jellyfin/.env
echo "WEBSERVER_PORT=$WEBSERVER_PORT" >>/vrchat-jellyfin/.env

#start vrchat-jellyfin
cd /vrchat-jellyfin
npm_config_yes=true npx pm2 start dist/index.js --name vrc-jellyfin --restart-delay 0 --no-daemon
