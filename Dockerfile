# Use an official Node.js runtime as a parent image (Node.js 18 or later)
FROM node:18

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json into the container
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Expose the ports that the apps will run on
EXPOSE 3000

# Run the app when the container starts
CMD ["sh", "-c", "npm start"]
