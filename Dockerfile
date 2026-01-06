# Production Build for Developers Hub
# Stage 1: Build Frontend
FROM node:20-alpine AS build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Production Server
FROM node:20-alpine
WORKDIR /app

# Install production dependencies only
COPY package*.json ./
RUN npm install --omit=dev

# Copy all source files (including server/ directory)
COPY . .

# Copy built assets from stage 1 over to the root dist folder
COPY --from=build-stage /app/dist ./dist

# Ensure the uploads directory exists for order screenshots
RUN mkdir -p server/uploads

# Railway injects the PORT environment variable automatically
ENV PORT=5000
EXPOSE 5000

# Start the unified server
CMD ["npm", "start"]
