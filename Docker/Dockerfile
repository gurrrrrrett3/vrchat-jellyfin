FROM alpine:edge

#install needed packages
RUN apk update
RUN apk upgrade
RUN apk add bash git npm nano
RUN git clone https://github.com/gurrrrrrett3/vrchat-jellyfin.git

#build vrchat-jellyfin
COPY buildnpm.sh /buildnpm.sh
RUN chmod +x /buildnpm.sh
RUN /buildnpm.sh
RUN rm -f /buildnpm.sh

#copy and mark executible the startup script for vrchat-jellyfin
COPY startup.sh /startup.sh
RUN chmod +x /startup.sh

WORKDIR ~

ENTRYPOINT ["/bin/bash"]
CMD ["/startup.sh"]
