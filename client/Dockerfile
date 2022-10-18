FROM node:16

WORKDIR /

COPY . .

RUN npm install
RUN npm run build

EXPOSE 8081

CMD ["npx", "serve", "-p", "8081", "-s", "dist"]