#Stage 1: Build environment
FROM node:20-alpine AS build
WORKDIR /app

#Define build arguments
ARG REACT_APP_KEYCLOAK_URL
ARG REACT_APP_KEYCLOAK_REALM
ARG REACT_APP_KEYCLOAK_CLIENT_ID

#Map build arguments to environment variables so Vite can embed them during compilation
ENV REACT_APP_KEYCLOAK_URL=$REACT_APP_KEYCLOAK_URL
ENV REACT_APP_KEYCLOAK_REALM=$REACT_APP_KEYCLOAK_REALM
ENV REACT_APP_KEYCLOAK_CLIENT_ID=$REACT_APP_KEYCLOAK_CLIENT_ID

#Install dependencies
COPY package*.json ./
RUN npm ci

#Copy source code and build the static assets
COPY . .
RUN npm run build

#Stage 2: Production environment
FROM nginx:alpine AS final

#Remove default Nginx static assets
RUN rm -rf /usr/share/nginx/html/*

#Copy the compiled Vite SPA from the build stage (Vite outputs to /dist by default)
COPY --from=build /app/dist /usr/share/nginx/html

#Configure Nginx to support React Router by falling back to index.html
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

ENTRYPOINT ["nginx", "-g", "daemon off;"]