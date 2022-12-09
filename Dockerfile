FROM golang:1.19-alpine AS builder
ENV CGO_ENABLED=0
WORKDIR /backend
COPY vm/go.* .
RUN --mount=type=cache,target=/go/pkg/mod \
    --mount=type=cache,target=/root/.cache/go-build \
    go mod download
COPY vm .
RUN --mount=type=secret,id=application.yml,dst=./application.yml \
    --mount=type=cache,target=/go/pkg/mod \
    --mount=type=cache,target=/root/.cache/go-build \
    go build -trimpath -ldflags="-s -w" -o bin/service

FROM --platform=$BUILDPLATFORM node:18.9-alpine3.15 AS client-builder
WORKDIR /ui
# cache packages in layer
COPY ui/package.json /ui/package.json
COPY ui/package-lock.json /ui/package-lock.json
RUN --mount=type=cache,target=/usr/src/app/.npm \
    npm set cache /usr/src/app/.npm && \
    npm ci
# install
COPY ui /ui
RUN npm run build

FROM alpine
LABEL org.opencontainers.image.title="Akita" \
    org.opencontainers.image.description="Drop in Agent for API Monitoring and Observability" \
    org.opencontainers.image.vendor="Akita Software" \
    com.docker.desktop.extension.api.version="0.3.0" \
    com.docker.desktop.extension.icon="https://drive.google.com/uc?export=view&id=1MeT_AQCo7CoeGAGHlRajObnF09CWbpBR" \
    com.docker.extension.screenshots="[ \
        { \
            \"alt\": \"Agent Page - dark screenshot\", \
            \"url\": \"https://drive.google.com/uc?export=view&id=1jwSe7Y9cC2lJQNfrlyCd0UnNe6gaeNnf\" \
        }, \
        { \
            \"alt\": \"Agent Page - light screenshot\", \
            \"url\": \"https://drive.google.com/uc?export=view&id=1v9Tmi-nMsE0VVk_QZXeQHr_YKuO-vxIA\" \
        }, \
        { \
            \"alt\": \"Settings - dark screenshot\", \
            \"url\": \"https://drive.google.com/uc?export=view&id=1F8x8m2VV4Wv1TXxauSSL7Pzykw5Jhd41\" \
        }, \
        { \
            \"alt\": \"Settings - light screenshot\", \
            \"url\": \"https://drive.google.com/uc?export=view&id=1yVheBSkx4h2fUsD8ZbAKSiTuVu4ydoTq\" \
        } \
    ]" \
    com.docker.extension.detailed-description=" \
        <p> \
            Akita is the fastest, easisest way to see what API endpoints you have, what's slow, and what's throwing errors. \
            API monitoring, no code changes required. The Akita Docker Desktop Extension makes it easy to try out Akita without additional work. \
        </p> \
        <h2>What can you do with Akita?</h2> \
        <ul> \
            <li> \
                <strong>See your API endpoints.</strong> Automatically get a searchable map of your API endpoints in use. \
                Explore by latency, errors, and usage. Export as OpenAPI specs. \
            </li> \
            <li> \
                <strong>See slow endpoints and endpoints with errors.</strong> \
                Without having to instrument every endpoint, quickly see which endpoints need the most attention. \
            </li> \
            <li> \
                <strong>Automatically monitor across your endpoints.</strong> \
                Automatically monitor volume, latency, and errors across each of your endpoints. \
                Set per-endpoint alerts. \
            </li> \
        </ul> \
        \
        <p> \
            We're in beta and would love to have you help us build the API monitoring tool you love to use!&nbsp; \
            <a href=\"https://www.akitasoftware.com/beta-signup?utm_source=docker&utm_medium=link&utm_campaign=beta_from_docker\">Join our beta here</a>. \
        </p> \
        \
        <h2>Resources</h2> \
        <ul> \
            <li><a href=\"https://www.akitasoftware.com\">Website</a></li> \
            <li><a href=\"https://www.akitasoftware.com/beta-signup?utm_source=docker&utm_medium=link&utm_campaign=beta_from_docker\">Beta Signup</a></li> \
            <li><a href=\"https://docs.akita.software/docs/docker-extension\">Docker Desktop Extension Documentation</a></li> \
            <li><a href=\"https://docs.akita.software/docs/\">Akita Docs</a></li> \
        </ul> \
    " \
    com.docker.extension.publisher-url="https://www.akitasoftware.com" \
    com.docker.extension.additional-urls="" \
    com.docker.extension.changelog="First Release!" \
    com.docker.extension.account-info="required" \
    com.docker.extension.categories="networking,utility-tools"

COPY --from=builder /backend/bin/service /
COPY docker-compose.yaml .
COPY metadata.json .
COPY aki_full.svg .
COPY --from=client-builder /ui/build ui
CMD /service -socket /run/guest-services/extension-akita.sock
