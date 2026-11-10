# Multi-stage Dockerfile for TRUSTCHAIN AUDIT Platform
FROM node:22-alpine AS builder

WORKDIR /app

# Copy root and package definitions
COPY package*.json ./
COPY server/package*.json ./server/
COPY client/package*.json ./client/

# Install dependencies
RUN npm install
RUN cd server && npm install
RUN cd client && npm install

# Copy source code
COPY server ./server
COPY client ./client

# Build backend and frontend
RUN cd server && npm run build
RUN cd client && npm run build

# Production runtime stage
FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=5001

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/server/package*.json ./server/
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/server/node_modules ./server/node_modules
COPY --from=builder /app/client/dist ./client/dist

# Expose server port
EXPOSE 5001

CMD ["node", "server/dist/index.js"]

