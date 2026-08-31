FROM php:8.2-cli
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
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
WORKDIR /app
RUN composer install --no-dev --optimize-autoloader
RUN npm ci && npm run build
CMD php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=$PORT
