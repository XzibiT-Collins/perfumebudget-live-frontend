# syntax=docker/dockerfile:1.7

FROM node:22-alpine AS build
WORKDIR /app

ARG VITE_GOOGLE_AUTH_URL
ARG VITE_ALLOWED_HOSTS
ARG VITE_API_BACKEND_URL
ARG VITE_API_BASE_URL
ARG VITE_GOOGLE_MAPS_API_KEY

ENV VITE_GOOGLE_AUTH_URL=$VITE_GOOGLE_AUTH_URL
ENV VITE_ALLOWED_HOSTS=$VITE_ALLOWED_HOSTS
ENV VITE_API_BACKEND_URL=$VITE_API_BACKEND_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_GOOGLE_MAPS_API_KEY=$VITE_GOOGLE_MAPS_API_KEY

COPY package*.json ./
RUN npm ci --ignore-scripts

COPY . .
RUN npm run build

FROM nginx:stable-alpine AS runtime

RUN rm /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf.template
COPY start.sh /start.sh
RUN chmod +x /start.sh

ENV PORT=8080
EXPOSE 8080

CMD ["/start.sh"]
