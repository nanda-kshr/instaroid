
# Stage 1: Build the Next.js application
# Using a lightweight Node.js image for the build process
FROM node:18-alpine AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker's layer caching.
# This means if only your source code changes, these layers won't be rebuilt.
COPY package.json package-lock.json ./

# Install project dependencies.
# Using 'npm ci' for clean and reproducible builds, especially in CI/CD environments.
RUN npm ci

# Copy the rest of the application code into the working directory
COPY . .

# Build the Next.js application for production
RUN npm run build

# Stage 2: Create the production-ready image
# Using a lightweight Node.js image for the runtime environment
FROM node:18-alpine AS runner

# Set the working directory inside the container
WORKDIR /app

# Copy only the essential build output and production dependencies from the builder stage.
# This dramatically reduces the final image size.
# Assuming Next.js's standalone output for optimized deployment.
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/package.json ./package.json

# Create the /logs directory as requested.
# Your application should be configured to write its logs to /logs/app.log.
RUN mkdir -p /logs

# Set environment variables for the production environment
ENV NODE_ENV=production
ENV PORT=3000

# Expose the port on which the Next.js application will run
EXPOSE 3000

# Command to start the Next.js application in production mode.
# For standalone output, 'node server.js' is the common entry point.
CMD ["node", "server.js"]
