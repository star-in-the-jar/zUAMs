# Use Node.js version to match development environment
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy environment files first (if they exist)
COPY .env* ./

# Copy the rest of the application code
COPY . .

# Expose the port that Vite uses in development mode
EXPOSE 5173

# Start the development server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]