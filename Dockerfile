FROM node:10.15.0-alpine

RUN apk update && apk upgrade
RUN apk add bash vim

RUN mkdir /app
WORKDIR /app

COPY package.json package.json
COPY yarn.lock yarn.lock

RUN yarn

ADD . /app

EXPOSE 3000

CMD bash -c "yarn start"
