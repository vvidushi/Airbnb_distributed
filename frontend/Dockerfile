# Frontend Dockerfile - Multi-stage build
# Stage 1: Build the React app
FROM node:18-alpine AS builder

WORKDIR /app

# Accept build arguments
ARG REACT_APP_API_URL
ARG REACT_APP_AI_URL
ARG REACT_APP_AI_API_URL

# Set as environment variables for React build
ENV REACT_APP_API_URL=${REACT_APP_API_URL}
ENV REACT_APP_AI_URL=${REACT_APP_AI_URL}
ENV REACT_APP_AI_API_URL=${REACT_APP_AI_API_URL}

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the app (environment variables are baked into the build)
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy built files from builder
COPY --from=builder /app/build /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

