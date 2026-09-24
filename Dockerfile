FROM node:20-alpine
workdir /app
COPY package*.json ./
RUN npm install 
EXPOSE 3000
COPY . .
CMD ["node", "app.js"]
