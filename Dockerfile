FROM node

WORKDIR /code

ENV PORT 80

COPY package.json /code/package.json

RUN npm install

COPY . /code

CMD ["node", "src/server.js"]