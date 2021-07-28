FROM node:12

WORKDIR /app

COPY package.json .
COPY yarn.lock .
COPY src/listener.js .

RUN yarn install

EXPOSE 8000

CMD ["node","listener.js"]