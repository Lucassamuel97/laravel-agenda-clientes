# Usa a imagem base PHP 8.2 FPM
FROM php:8.2-fpm

# Instala dependências do sistema e extensões do PHP
RUN apt-get update && apt-get install -y \
    git \
    unzip \
    zip \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    libzip-dev \
    libcurl4-openssl-dev \
    redis-server \
    liblz4-tool \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip

# Instala a extensão Redis via PECL
RUN pecl install redis \
    && docker-php-ext-enable redis

# Instala o Composer
COPY --from=composer:2.6 /usr/bin/composer /usr/bin/composer

# Define diretório de trabalho
WORKDIR /var/www

# Expõe a porta 8000
EXPOSE 8000 
