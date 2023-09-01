# Build Stage
FROM node:latest AS build

WORKDIR /app

# Install SSH and git for cloning the private repository
RUN apt-get update && apt-get install -y --no-install-recommends \
    ssh \
    git

# Copy your SSH private key to the build container (place your id_rsa file in the same directory as the Dockerfile)
COPY id_rsa /root/.ssh/id_rsa

# Set correct permissions for the SSH key
RUN chmod 600 /root/.ssh/id_rsa

# Add the GitHub server to known hosts
RUN ssh-keyscan -t rsa github.com >> /root/.ssh/known_hosts

# Clone the private repository (replace <repository_url> with the actual URL)
RUN git clone git@github.com:Viking-PMC/musical-waddle.git  .

# Switch to the /app/backend directory where your package.json is located
WORKDIR /app/backend

# Install dependencies
RUN npm install

# Build the application
RUN npm run build


# Production Stage
FROM node:bullseye-slim AS production

WORKDIR /app

# Copy the compiled application from the build stage
COPY --from=build /app/backend/dist ./dist
COPY --from=build /app/backend/package*.json ./

# Install production dependencies
RUN npm install --production

# Set ownership to the non-root user "node" for security
RUN chown -R node:node /app

USER node

# Start the application
CMD ["node", "dist/index.js"]
