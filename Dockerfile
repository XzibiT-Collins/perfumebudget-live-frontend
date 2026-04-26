# Single stage build - using Node for both build and production
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies (all, since we need dev deps for build)
RUN npm ci

# Copy source code
COPY . .

# Build the React app with Vite
RUN npm run build

# Expose port (Railway will override with $PORT environment variable)
EXPOSE 3000

# Set NODE_ENV to production
ENV NODE_ENV=production

# Start the Express server which serves the built dist folder
CMD ["npm", "run", "preview"]
