# Stage 1: Build the Next.js application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package.json and lock files to leverage Docker cache
COPY package.json yarn.lock* package-lock.json* ./

# Install dependencies
# Using --frozen-lockfile ensures that the exact versions specified in the lock file are used.
RUN npm install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Build the Next.js application for production
RUN npm run build

# Stage 2: Serve the application in a lightweight runtime environment
FROM node:20-alpine AS runner

WORKDIR /app

# Set environment variable for Next.js production mode
ENV NODE_ENV=production

# Only copy necessary build artifacts and runtime dependencies from the builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

# Expose the port Next.js listens on
EXPOSE 3000

# Start the Next.js production server
CMD ["npm", "start"]