FROM node:22-slim

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm install --production=false

# Copy source
COPY tsconfig.json ./
COPY src/ ./src/

# Build
RUN npm run build

# Remove dev dependencies
RUN npm prune --production

# Create data directory
RUN mkdir -p /data/files

EXPOSE 3001

ENV PORT=3001
ENV DATA_DIR=/data
ENV NODE_ENV=production

CMD ["node", "dist/index.js"]
