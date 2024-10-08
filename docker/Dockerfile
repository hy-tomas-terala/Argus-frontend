# This image installs all dependencies and compiles the Argus frontend into a
# set of static files that can be served by any webserver.
# It should run with the git repo root as the build context
FROM node:16-bullseye AS build
WORKDIR /app

COPY . /app

RUN npm ci
RUN npx browserslist@latest --update-db
RUN npm run build

##########################################################
# production environment consisting only of nginx and the statically compiled
# Argus Frontend application files produced by the build stage
# FROM: https://mherman.org/blog/dockerizing-a-react-app/

#RUN apk add --update tini tree

# run unprivileged nginx
FROM nginxinc/nginx-unprivileged:stable

# copy files from build to nginx
COPY --from=build /app/build /usr/share/nginx/html

# Remove default configuration file
RUN rm -rf /etc/nginx/conf.d
COPY docker/conf /etc/nginx/conf.d

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY docker/runtime-config-template.json /

ENV REACT_APP_BACKEND_URL=http://fake
ENV REACT_APP_ENABLE_WEBSOCKETS_SUPPORT=true
ENV REACT_APP_BACKEND_WS_URL=ws://fake
ENV REACT_APP_COOKIE_DOMAIN=fake
ENV REACT_APP_USE_SECURE_COOKIE=false
ENV REACT_APP_DEBUG=false
ENV REACT_APP_DEFAULT_AUTO_REFRESH_INTERVAL=30
ENV REACT_APP_REALTIME_SERVICE_MAX_RETRIES=5

#ENTRYPOINT ["/sbin/tini", "-v", "--"]
ENV runtime-config-template.json=/usr/share/nginx/html/runtime-config.json
CMD ["nginx", "-g", "daemon off;"]
