# vrchat-jellyfin

[![Docker](https://github.com/gurrrrrrett3/vrchat-jellyfin/actions/workflows/docker-publish.yml/badge.svg)](https://github.com/gurrrrrrett3/vrchat-jellyfin/actions/workflows/docker-publish.yml)

a jellyfin client designed for vrchat

> [!IMPORTANT]
>
> ### Incomplete Project
>
> While this project is functional, it is not yet complete. The end goal is to have a link that can be pasted into the vrchat client, then use the jellyfin cast feature to control the player like a chromecast. This is not yet implemented, and the current implementation is a workaround.

handles requesting media from jellyfin in a format that can be played in vrchat, as well as proxying urls to bypass the risk of sharing a jellyfin api key

## Installation

install nodejs and npm

```bash
npm install
npm run build
```

## Usage

rename the `.env.example` file to `.env` and fill in the required fields.  

it's reccommended to use a process manager like pm2 to keep it running:

```bash
pm2 start dist/index.js --name vrc-jellyfin
pm2 save
```
make sure to do `pm2 startup` if you haven't already so it autostarts

go to the web interface, select media, and copy the link. paste the link into the vrchat client to play the media

## Tips
- If the player has a switch between **Video** and **Stream**, use **Stream**
- I've personally had better luck with the Unity video player over the AVPro one, but both should work
- If you change the video encoding settings, 720p (the default) works best for most devices. I wouldn't go above 1080p unless you have a smaller group or high upload bandwitdh.

## Docker

A docker image is provided for easy deployment

### Running

docker compose (recommended):

```yaml
services:
  vrchat-jellyfin:
    image: ghcr.io/gurrrrrrett3/vrchat-jellyfin:master
    container_name: vrchat-jellyfin
    restart: unless-stopped
    ports:
      - 4000:4000
    environment:
      JELLYFIN_HOST: <http[s]://URL>
      JELLYFIN_USERNAME: <USERNAME>
      JELLYFIN_PASSWORD: <PASSWORD>
```

docker cli:

```bash
docker run -d \
--name vrchat-jellyfin \
--restart unless-stopped \
-p 4000:4000 \
-e JELLYFIN_HOST=<http[s]://URL> \
-e JELLYFIN_USERNAME=<USERNAME> \
-e JELLYFIN_PASSWORD=<PASSWORD> \
ghcr.io/gurrrrrrett3/vrchat-jellyfin:master
```

## Progress

- [x] Jellyfin proxy 
- [x] Transcoding
- [ ] Subtitle Baking
- [ ] Subtitle/audio track selection
- [x] Temp Web interface
- [ ] Support for the jellyfin cast api
- [ ] Video Stream generation (splash screen with instructions, etc)
- [x] Docker
- [ ] Seeking (not sure if this is possible)
