FROM node:latest
COPY src /srv
WORKDIR /srv
RUN ["/usr/local/bin/npm", "install"]
CMD ["/usr/local/bin/node", "/srv/app.js"]
