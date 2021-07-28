FROM node:12

WORKDIR /app

COPY src/package.json .
COPY src/listener.js .

RUN yarn install

EXPOSE 8000

CMD ["node","listener.js"]