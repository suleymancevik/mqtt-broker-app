# Step 1: Use a base image
# This defines the operating system and environment (Node.js in this case)
FROM node:18-alpine

# Step 2: Set the working directory in the container
WORKDIR /usr/src/app

# Step 3: Copy package.json and package-lock.json for dependency installation
COPY package*.json ./

# Step 4: Install dependencies (only production dependencies are installed in this example)
RUN npm install --production

# Step 5: Copy the rest of your application files into the container
COPY . .

# Step 6: Expose the port your application uses
# The port must match the one your MQTT broker listens on (e.g., 8085).
EXPOSE 8080 8085

# Step 7: Define the command to run your application
CMD ["node", "mqtt.js"]