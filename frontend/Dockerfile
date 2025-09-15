# Frontend Dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

# To enable HTTPS, mount ssl/server.crt and ssl/server.key and use serve's --ssl-cert and --ssl-key options
# Example:
# npx serve dist --listen 3000 --ssl-cert ../ssl/server.crt --ssl-key ../ssl/server.key
