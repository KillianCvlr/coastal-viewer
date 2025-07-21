# Use a Node image with npm
FROM node:20-alpine

WORKDIR /app

# Install dependencies separately to cache
COPY package.json package-lock.json* ./
RUN npm install

# Copy the rest of the frontend files
COPY . .

EXPOSE 5173
