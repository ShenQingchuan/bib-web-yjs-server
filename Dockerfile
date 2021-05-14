FROM node:14

RUN mkdir -p /usr/bibyjs
COPY . /usr/bibyjs
WORKDIR /usr/bibyjs

EXPOSE 2048
RUN npm install
ENTRYPOINT node ./server.js
