FROM node:22-alpine3.20

ENV NODE_ENV=development
ENV NODE_OPTIONS=--openssl-legacy-provider

WORKDIR /nuxt-app

COPY ./src/package*.json /nuxt-app/
RUN apk update && apk add --update npm

RUN npm install -g npm && npm install  && npm cache clean --force 
