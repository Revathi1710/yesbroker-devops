FROM node:22
WORKDIR /app

# Copy package.json from the parent directory context
COPY ../package*.json ./

RUN npm install

COPY . .

EXPOSE 5000

CMD ["node", "server.js"]