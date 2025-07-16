
# Stage 1: Build the Next.js application
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package.json and yarn.lock/package-lock.json to install dependencies
COPY package.json yarn.lock* package-lock.json* ./

# Install production dependencies
RUN npm install --production --frozen-lockfile || yarn install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Build the Next.js application
RUN npm run build

# Stage 2: Create the production-ready image
FROM node:18-alpine AS runner

WORKDIR /app

ENV NODE_ENV production

# Copy the standalone output from the builder stage
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000

CMD ["node", "server.js"]
