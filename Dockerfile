#Stage 1: Build the React Application
FROM node:20-alpine AS build
WORKDIR /app

#Install dependencies
COPY src/Frontend/package*.json ./
RUN npm install

#Copy source and build the optimized static assets
COPY src/Frontend/ ./
RUN npm run build

#Stage 2: Serve with NGINX
FROM nginx:alpine
#Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

#Copy built assets from the build stage
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]