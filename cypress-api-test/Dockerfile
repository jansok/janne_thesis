FROM cypress/included:7.2.0

WORKDIR /usr/src/app
COPY package.json .
RUN npm install --quiet
COPY . .

ENTRYPOINT npm test