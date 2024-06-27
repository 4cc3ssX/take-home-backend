# Base image
FROM node:18

# Create app directory
WORKDIR /usr/src/app

# Copy package.json and yarn.lock
COPY package.json .
COPY yarn.lock .


# Install app dependencies
RUN yarn install --frozen-lockfile

# Bundle app source
COPY . .

# Copy the .env and .env.development files
# COPY .env .env.development ./

# Creates a "dist" folder with the production build
RUN yarn build

# Expose the port on which the app will run
EXPOSE 3000

# Start the server using the production build
CMD ["yarn", "start:prod"]
