FROM node:25-alpine

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Copy source code
COPY src ./src
COPY tsconfig.json ./

# Build TypeScript
RUN pnpm run build

# Expose port (adjust as needed)
EXPOSE 3000

# Start application
CMD ["pnpm", "start"]