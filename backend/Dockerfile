FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production

# Copy source
COPY . .

# Expose API port
EXPOSE 4000

# Start server
CMD ["npm", "start"]
