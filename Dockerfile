# Use official PHP CLI image
FROM php:8.2-cli

# Install system dependencies, PostgreSQL dev libraries, zip extension, and Node.js
RUN apt-get update && apt-get install -y \
    git \
    unzip \
    libzip-dev \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    libpq-dev \
    curl \
    && docker-php-ext-install zip pdo_mysql pdo_pgsql mbstring pcntl bcmath gd \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /app

# Copy application files
COPY . .

# Install PHP and Node dependencies
RUN composer install --no-dev --optimize-autoloader --no-scripts --ignore-platform-reqs
RUN npm ci && npm run build

# Start server safely
CMD php artisan optimize:clear && php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=$PORT
