# Lab 6 - containerize the Ionic CRUD application.
# The lab manual uses the Ionic CLI development server inside the container,
# so the image stays intentionally close to `ionic serve`.
FROM node:22-alpine

# Set the working directory inside the container.
WORKDIR /app

# Keep CLI first-run prompts out of the container logs.
ENV NG_CLI_ANALYTICS=false \
    IONIC_CLI_TELEMETRY=false

# Install the Ionic CLI globally (required by the CMD below).
RUN npm install -g @ionic/cli@latest

# Copy only the dependency manifests first so Docker can cache this layer.
COPY package.json package-lock.json ./

# Install the exact dependency tree from the lockfile.
RUN npm ci --no-audit --no-fund

# Copy the remaining project files.
COPY . .

# The Ionic dev server listens on 8100.
EXPOSE 8100

# Give the Angular dev server time to compile before the first health check.
HEALTHCHECK --interval=30s --timeout=5s --start-period=120s --retries=5 \
  CMD wget -qO- http://127.0.0.1:8100/ > /dev/null || exit 1

# Bind to all interfaces so the port mapping works, and never open a browser.
CMD ["ionic", "serve", "--host=0.0.0.0", "--port=8100", "--no-open", "--no-interactive"]
