# Build frontend
FROM node:20-alpine AS build-client
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
# We pass the build variables so the production bundle can reach the API on the same domain
ENV VITE_API_URL=/api
RUN npm run build

# Build backend
FROM node:20-alpine AS build-server
WORKDIR /app/server
COPY server/package*.json ./
RUN npm install --production
COPY server/ ./

# Serve static frontend from backend
FROM node:20-alpine
WORKDIR /app

# Copy backend files from server build stage
COPY --from=build-server /app/server/package*.json ./
COPY --from=build-server /app/server/node_modules ./node_modules
COPY --from=build-server /app/server ./

# Explicitly ensure the public folder exists and copy the frontend assets there
RUN mkdir -p public
COPY --from=build-client /app/client/dist/ ./public/

# Expose port (Cloud Run defaults to 8080)
EXPOSE 8080
ENV PORT=8080
ENV NODE_ENV=production

# Boot from the root
CMD ["node", "server.js"]
