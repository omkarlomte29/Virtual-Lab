# Frontend Dockerfile
FROM node:20.18.0-alpine AS build

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Serve the application
FROM nginx:alpine

# Copy the built assets from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Expose the frontend port
EXPOSE 3000

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
