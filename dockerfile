FROM node:22-alpine3.19

LABEL maintainer="gurrrrrrett3 <gart@gart.sh>"
LABEL version="1.0"
LABEL description="a Jellyfin client for VRChat."

WORKDIR /app

COPY package.json /app/package.json
COPY package-lock.json /app/package-lock.json
COPY . /app

RUN npm install
RUN npm run build

CMD ["npm", "run", "start:docker"]

# docker build -t vrchat-jellyfin .