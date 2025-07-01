FROM node:22-slim AS base
WORKDIR /usr/src/wpp-server
ENV NODE_ENV=production

# Instale dependências do sistema necessárias para build e runtime
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    chromium \
    gcc \
    g++ \
    make \
    libc6-dev \
    libvips-dev \
    libfftw3-dev \
    && rm -rf /var/lib/apt/lists/*

# Copie apenas arquivos de dependências
COPY package*.json ./

# Instale dependências de produção
RUN npm install --only=production --legacy-peer-deps --ignore-scripts && npm cache clean --force

# --- Fase de build ---
FROM node:22-slim AS build
WORKDIR /usr/src/wpp-server
ENV NODE_ENV=development

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    gcc \
    g++ \
    make \
    libc6-dev \
    libvips-dev \
    libfftw3-dev \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build && npm cache clean --force

# --- Imagem final ---
FROM node:22-slim AS final
WORKDIR /usr/src/wpp-server
ENV NODE_ENV=production

RUN apt-get update && \
    apt-get install -y --no-install-recommends chromium && \
    rm -rf /var/lib/apt/lists/*

COPY package*.json ./

# CORREÇÃO AQUI: Remova --ignore-scripts para permitir que bcrypt compile
RUN npm install --omit=dev --legacy-peer-deps && npm cache clean --force

COPY --from=build /usr/src/wpp-server/dist ./dist
COPY --from=build /usr/src/wpp-server/src ./src

EXPOSE 21465
ENTRYPOINT ["node", "dist/src/server.js"]