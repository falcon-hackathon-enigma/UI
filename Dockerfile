# Use the official Node.js image as the base image
FROM node:16 AS build

# Set the working directory in the container
WORKDIR /app

# Copy the package.json and package-lock.json files to the container
COPY package*.json ./

# Install the dependencies
RUN npm install

# Copy the rest of the application code to the container
COPY . .

# Build the React application
RUN npm run build

# Use the official Nginx image to serve the React application
FROM devendranathashok/codegenie:1.0.1

# Copy the build output to the Nginx html directory
COPY --from=build /app/build /usr/share/nginx/html

# Expose port 80 443
EXPOSE 80 443

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]