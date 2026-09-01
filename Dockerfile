# --- Stage 1: Build Frontend Assets ---
FROM node:20-alpine AS frontend
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# --- Stage 2: Final Production Environment ---
FROM php:8.2-cli

# Install system dependencies & PHP extensions
RUN apt-get update && apt-get install -y \
    git \
    unzip \
    libzip-dev \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    libpq-dev \
    curl \
    && docker-php-ext-install zip pdo_mysql pdo_pgsql mbstring pcntl bcmath gd

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /app

# Copy application files
COPY . .

# Copy built frontend assets from Stage 1
COPY --from=frontend /app/public/build ./public/build

# Install PHP dependencies strictly without running any scripts
RUN composer install --no-dev --optimize-autoloader --no-scripts --ignore-platform-reqs

# Expose port and start Laravel server
CMD php artisan optimize:clear && php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=$PORT
