# builder stage
FROM node:20-alpine AS builder

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

# Copy mail & view templates to dist during build
RUN cp -r mail dist/ && cp -r views dist/

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

# Copy built application from builder stage
COPY --from=builder /usr/src/app/dist ./dist

# Create a specific directory for mail templates
RUN mkdir -p /app/dist/mail
COPY --from=builder /usr/src/app/dist/mail ./dist/mail

# Create a specific directory for view templates
RUN mkdir -p /app/dist/views
COPY --from=builder /usr/src/app/dist/views ./dist/views

# Expose application port
EXPOSE 3000

ENV NODE_ENV=production

# Start the application
CMD ["node", "dist/main"]