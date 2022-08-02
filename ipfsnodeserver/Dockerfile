FROM node:16-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
RUN mkdir -p /tmp
CMD ["node","ipfs-client.js"]