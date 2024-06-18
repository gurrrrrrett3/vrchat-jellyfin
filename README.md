# vrchat-jellyfin

a jellyfin client designed for vrchat

> [!IMPORTANT]
>
> ### Incomplete Project
>
> While this project is functional, it is not yet complete. It is not recommended to use this project in a production environment.

handles requesting media from jellyfin and transcoding it to a format that can be played in vrchat, as well as proxying urls to bypass the risk of sharing a jellyfin api key

## Installation

install nodejs and npm

```bash
npm install
npm run build
```

## Usage

rename the `.env.example` file to `.env` and fill in the required fields

```bash
npm run start
```

go to the web interface, select media, and copy the link. paste the link into the vrchat client to play the media

## Progress

- [x] Jellyfin proxy 
- [x] Transcoding
- [ ] Subtitle Baking
- [x] Web interface
- [ ] Support for the jellyfin cast api

