IMAGE?=akitasoftware/akita-docker-extension
TAG?=latest

BUILDER=buildx-multi-arch

INFO_COLOR = \033[0;36m
NO_COLOR   = \033[m

rm-extension: ## Removes the extension
	docker extension rm $(IMAGE):$(TAG)
.PHONY: rm-extension

build-extension: ## Build service image to be deployed as a desktop extension
	docker build --tag=$(IMAGE):$(TAG) .
.PHONY: build-extension


install-extension: build-extension ## Install the extension
	docker extension install $(IMAGE):$(TAG)
.PHONY: install-extension

dev-extension: install-extension
	@docker extension dev-ui source $(IMAGE):$(TAG) http://localhost:3000
	@npm start --prefix ui
.PHONY: dev-extension

update-extension: build-extension ## Update the extension
	docker extension update $(IMAGE):$(TAG)
.PHONY: update-extension

prepare-buildx: ## Create buildx builder for multi-arch build, if not exists
	docker buildx inspect $(BUILDER) || docker buildx create --name=$(BUILDER) --driver=docker-container --driver-opt=network=host
.PHONY: prepare-buildx

push-extension: prepare-buildx ## Build & Upload extension image to hub. Do not push if tag already exists: make push-extension tag=0.1
	docker pull $(IMAGE):$(TAG) && echo "Failure: Tag already exists" || docker buildx build --push --builder=$(BUILDER) --platform=linux/amd64,linux/arm64 --build-arg TAG=$(TAG) --tag=$(IMAGE):$(TAG) .
.PHONY: push-extension

push-extension-latest: prepare-buildx ## Build & Upload extension image to hub with special tag "latest"
	docker pull $(IMAGE):$(TAG) && echo "Failure: Tag already exists" || docker buildx build --push --builder=$(BUILDER) --platform=linux/amd64,linux/arm64 --build-arg TAG=$(TAG) --tag=$(IMAGE):$(TAG) --tag=$(IMAGE):latest .
.PHONY: push-extension-latest

help: ## Show this help
	@echo Please specify a build target. The choices are:
	@grep -E '^[0-9a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "$(INFO_COLOR)%-30s$(NO_COLOR) %s\n", $$1, $$2}'

.PHONY: help
