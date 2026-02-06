FROM --platform=linux/amd64 node:20-alpine

WORKDIR /app

EXPOSE 6201
# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Generate Prisma client
RUN pnpm exec prisma generate

# Build the application
RUN pnpm run build


# Start the server
CMD ["pnpm", "start"]
