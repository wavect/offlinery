# Development stage
FROM node:20-alpine AS development

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Set working directory
WORKDIR /usr/src/app

# Copy package files
COPY pnpm-lock.yaml package.json ./

# Install dependencies
RUN pnpm install

# Copy source code
COPY . .

# Build the application
RUN pnpm build

# Production stage
FROM node:20-alpine AS production

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Set NODE_ENV
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

# Set working directory
WORKDIR /usr/src/app

# Copy package files
COPY pnpm-lock.yaml package.json ./

# Install only production dependencies
RUN pnpm install --prod

# Copy built application from development stage
COPY --from=development /usr/src/app/dist ./dist

# Expose application port
EXPOSE 3000

# Start the application
CMD ["node", "dist/main"]