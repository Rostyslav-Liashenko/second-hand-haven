FROM node:18-alpine3.19

ARG MAX_OLD_SPACE_SIZE=4096
ENV NODE_OPTIONS=--max-old-space-size=${MAX_OLD_SPACE_SIZE}

WORKDIR /app
COPY package*.json ./
COPY . .

RUN npm config set registry http://registry.npmjs.org/
RUN npm install
RUN npm run build

CMD [ "node", "./dist/main.js" ]
EXPOSE 8080