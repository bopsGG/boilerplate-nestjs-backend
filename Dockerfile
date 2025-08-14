# Use base image
FROM node:lts

# Use root to avoid permission issues during build
# USER root

# Set working directory inside the container
WORKDIR /usr/src/app

# Copy dependency definitions
COPY package*.json yarn.lock ./

# Install dependencies with flags to avoid permission errors
# RUN yarn install --frozen-lockfile --unsafe-perm
RUN yarn install

# Copy the entire project source
COPY . .

# Build project
RUN yarn build

# Expose application port
EXPOSE 3000

# Run the application
CMD ["yarn", "start:prod"]
