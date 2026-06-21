# Use the official Node.js 20 lightweight Alpine image
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy the package description files
COPY package*.json ./

# Install project dependencies
RUN npm ci --silent

# Copy the rest of the application source code files
COPY . .

# Build the React frontend production bundle assets
RUN npm run build

# Expose the API server listening port
EXPOSE 3000

# Set environment to production
ENV NODE_ENV=production

# Run database seed before starting if needed (optional)
# CMD ["node", "seed.js"]

# Run the backend express server which also serves the frontend statically
CMD ["npm", "start"]
