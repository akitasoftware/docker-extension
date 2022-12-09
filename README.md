# Akita Docker Extension

This Repository hosts the code for
Akita's [Docker Extension](https://hub.docker.com/repository/docker/akitasoftware/akita-docker-extension).
The Extension lets Docker users run and configure the [Akita Agent](https://github.com/akitasoftware/akita-cli)
in Docker Desktop.

## Getting Started

To get started with the Docker Extension you will need to install Docker Desktop 4.8.0 or later.

To Install the latest version of the Docker Extension, run the following command:

` docker extension install akitasoftware/akita-docker-extension:latest `

To build the Docker Extension from source, navigate to the root of the repository and run the following command:

` make install-extension `

Navigate to Docker Desktop, and you should now see a new "Akita" section in the sidebar menu.

## Getting involved

* Please file bugs as issues to this repository.
* We welcome contributions! If you want to make changes please see our [contributing guide](CONTRIBUTING.md).
* We're always happy to answer any questions about the Docker Extension, or about how you
  can contribute. Email us at `opensource [at] akitasoftware [dot] com` or
  [request to join our Slack](https://docs.google.com/forms/d/e/1FAIpQLSfF-Mf4Li_DqysCHy042IBfvtpUDHGYrV6DOHZlJcQV8OIlAA/viewform?usp=sf_link)!

## What is Akita

Drop-in API monitoring, no code changes necessary.

Built for busy developer teams who don't have time to become experts in monitoring and observability, Akita is the
fastest, easiest way to see and monitor your API endpoints which makes it possible to quickly track API endpoints and
their usage in real time.

* **See API endpoints.** Automatically get a searchable map of your API endpoints in use. Explore by latency, errors,
  and usage. Export as OpenAPI specs.
* **Get drop-in API monitoring.** Get a drop-in view of volume, latency, and errors, updated in near real-time. Set
  per-endpoint alerts.
* **Quickly understand the impact of changes.** Keep track of the endpoints you care about and identify how new
  deployments impact your endpoints.

Simply drop Akita into your system to understand your system behavior, without having to instrument code or build your
own dashboards.

## Related links

* [Akita blog](https://www.akitasoftware.com/blog)
* [Extension Docs](https://docs.akita.software/docs/docker-extension)
* [Akita docs](https://docs.akita.software/)
* [Sign up for our private beta](https://www.akitasoftware.com/beta-signup)


