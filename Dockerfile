# Use an official Node.js image as the base image
# I'm choosing a slim version for a smaller image size, and a recent LTS version.
FROM node:20-alpine AS development

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker layer caching
# This step only re-runs if package.json or package-lock.json changes
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the Next.js application for production
# This command runs 'npm run build' which is typically defined in package.json
RUN npm run build

# --- Production Stage ---
# Use a smaller, production-ready image for the final artifact
FROM node:20-alpine AS production

WORKDIR /app

# Copy only the necessary files from the development stage
# This includes the built application, node_modules, and public assets
COPY --from=development /app/.next ./.next
COPY --from=development /app/node_modules ./node_modules
COPY --from=development /app/package.json ./package.json
COPY --from=development /app/public ./public

# Set the environment variable for the port Next.js will run on
ENV PORT 3000

# Expose the port
EXPOSE 3000

# Command to start the Next.js production server
CMD ["npm", "start"]
