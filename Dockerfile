# Use official PHP CLI image
FROM php:8.2-cli

# Install system dependencies and Node.js
RUN apt-get update && apt-get install -y \
    git \
    unzip \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    curl \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && docker-php-ext-install pdo_mysql mbstring pcntl bcmath gd

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /app

# Copy all project files FIRST
COPY . .

# Install PHP and Node dependencies, then build Vite assets
RUN composer install --no-dev --optimize-autoloader
RUN npm ci && npm run build

# Start Laravel's built-in server on Render's dynamic port
CMD php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=$PORT
