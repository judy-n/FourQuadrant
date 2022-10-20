FROM node:16

WORKDIR /

COPY . .

RUN npm install
RUN npm run build-dev

EXPOSE 8081

CMD ["node_modules/.bin/serve", "-p", "8081", "-s", "dist"]
