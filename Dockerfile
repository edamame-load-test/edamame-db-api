FROM node:19

RUN mkdir -p /home/db-api

COPY . /home/db-api

RUN npm install

EXPOSE 4444
CMD ["node", "index.js"]