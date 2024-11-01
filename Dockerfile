# Use Node.js Offcial Image
FROM node:20.18.0

# Create Work directory
WORKDIR /app

# Copy package.json and package-lock.json，then install dependencies
COPY package*.json ./
RUN npm install --production

# Copy App Source Code to the image
COPY . .

# Set Up Environment Variables
ENV NODE_ENV=production \
    DB_HOST=your_db_host \
    DB_USER=your_db_user \
    DB_PASSWORD=your_db_password \
    DB_NAME=your_db_name \
    DB_PORT=your_db_port

# Expose Port 7001
EXPOSE 7001

# Run App
CMD ["npm", "start"]