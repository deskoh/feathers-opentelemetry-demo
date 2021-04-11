# FeathersJS OpenTelemetry Demo

> Works for Feathers v5 (Dove)

## Quickstart

```sh
# Install dependencies
npm ci

# Start Zipkin
docker run -it --name zipkin -p 9411:9411 openzipkin/zipkin:2.23

# Start server
npm run dev

# Curl server
curl http://localhost:3030/messages

# View trace @ http://localhost:9411/
```

## References

[Getting started with OpenTelemetry JS](https://github.com/open-telemetry/opentelemetry-js/blob/main/getting-started/README.md)

[Lightstep - Getting Started with OpenTelemetry in JavaScript](https://opentelemetry.lightstep.com/js/)

[Compliance of Implementations with Specification](https://github.com/open-telemetry/opentelemetry-specification/blob/main/spec-compliance-matrix.md)

[Trace Semantic Conventions](https://github.com/open-telemetry/opentelemetry-specification/tree/main/specification/trace/semantic_conventions)

[CHANGELOG](https://github.com/open-telemetry/opentelemetry-js/blob/main/CHANGELOG.md)
