# Stage 1: Build
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Build for production
RUN npm run build

# Stage 2: Serve
FROM nginx:alpine

# Install gettext for envsubst
RUN apk add --no-cache gettext

# Copy custom nginx config template
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

# Copy built assets from Stage 1
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port (Railway will set PORT env var, but we verify exposed logic here)
EXPOSE 80

# Start Nginx with env substitution
# Railway sets $PORT. We need to substitute it in the template.
# nginx:alpine's default behavior checks /etc/nginx/templates/*.template
# and outputs to /etc/nginx/conf.d/default.conf with env substitution if we use the default entrypoint.
# However, to be explicit and robust:
CMD ["/bin/sh", "-c", "envsubst '${PORT}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
