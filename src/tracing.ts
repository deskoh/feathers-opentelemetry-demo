import { NodeTracerProvider } from '@opentelemetry/node';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { SimpleSpanProcessor } from '@opentelemetry/tracing';
import { ZipkinExporter } from '@opentelemetry/exporter-zipkin';
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';

import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { FeathersInstrumentation } from './instrumentation-feathers';

const provider = new NodeTracerProvider();

diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.ERROR);
provider.register();

registerInstrumentations({
  instrumentations: [
    new HttpInstrumentation(),
    new ExpressInstrumentation(),
    new FeathersInstrumentation(),
  ],
  tracerProvider: provider,
});

// Initialize the exporter.
const zipkinOptions = {
  serviceName: 'feathers-app',
}

/**
 *
 * Configure the span processor to send spans to the exporter
 * The SimpleSpanProcessor does no batching and exports spans
 * immediately when they end. For most production use cases,
 * OpenTelemetry recommends use of the BatchSpanProcessor.
 */
provider.addSpanProcessor(new SimpleSpanProcessor(new ZipkinExporter(zipkinOptions)));
// provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));

console.log('tracing initialized');
