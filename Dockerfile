FROM golang:1.19-alpine AS builder
ENV CGO_ENABLED=0
WORKDIR /backend
COPY vm/go.* .
RUN --mount=type=cache,target=/go/pkg/mod \
    --mount=type=cache,target=/root/.cache/go-build \
    go mod download
COPY vm .
RUN --mount=type=cache,target=/go/pkg/mod \
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
    com.docker.extension.detailed-description="" \
    com.docker.extension.publisher-url="https://www.akitasoftware.com" \
    com.docker.extension.additional-urls="" \
    com.docker.extension.changelog="First Release!"
    com.docker.extension.account-info="required"
    com.docker.extension.categories="networking,utility-tools"

COPY --from=builder /backend/bin/service /
COPY docker-compose.yaml .
COPY metadata.json .
COPY aki_full.svg .
COPY --from=client-builder /ui/build ui
CMD /service -socket /run/guest-services/extension-akita.sock
