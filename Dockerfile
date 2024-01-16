# FROM quay.io/keycloak/keycloak:latest as builder

# WORKDIR /opt/keycloak
# RUN /opt/keycloak/bin/kc.sh build

# FROM quay.io/keycloak/keycloak:latest
# COPY --from=builder /opt/keycloak/ /opt/keycloak/

# ENV KC_HOSTNAME=localhost
# ENTRYPOINT ["/opt/keycloak/bin/kc.sh", "start-dev"]

FROM node:alpine3.18 as keycloakify_jar_builder

RUN apk update && \
    apk add openjdk11 && \ 
    apk add maven;

# RUN apt-get update && \
#     apt-get install -y openjdk-11-jdk && \
#     apt-get install -y maven;

COPY ./template/package.json ./template/yarn.lock /opt/app/

WORKDIR /opt/app

RUN yarn install --frozen-lockfile

COPY ./template/ /opt/app/

RUN yarn build-keycloak-theme

FROM quay.io/keycloak/keycloak:latest as builder

WORKDIR /opt/keycloak

COPY --from=keycloakify_jar_builder /opt/app/build_keycloak/target/documentall-theme-keycloak-theme-5.1.3.jar /opt/keycloak/providers/
RUN /opt/keycloak/bin/kc.sh build


FROM quay.io/keycloak/keycloak:latest
COPY --from=builder /opt/keycloak/ /opt/keycloak/
ENV KC_HOSTNAME=localhost
ENTRYPOINT ["/opt/keycloak/bin/kc.sh", "start-dev"]