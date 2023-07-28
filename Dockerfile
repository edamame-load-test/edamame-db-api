FROM node:19

WORKDIR /Users/rachwest/Desktop/edamame-db-api

COPY . /Users/rachwest/Desktop/edamame-db-api

RUN apt-get update || : && apt-get install -y \
  python3 \
  python3-pip
RUN pip3 install awscli
RUN npm install

EXPOSE 4444
CMD ["node", "index.js"]
