import { context as traceContext, Span, trace } from '@opentelemetry/api';
import { Application } from '@feathersjs/feathers';
import { HookContext } from '@feathersjs/feathers/lib/dependencies';
import shimmer from 'shimmer';

const name = 'feathers';
const version = '0.1.0';
const tracer = trace.getTracer(name, version);

export default function opentelemetry () {
  return (app: Application) => {

    // Start service trace span in app before hook
    app.hooks([
      async (context, next) => {
        const { path, method } = context;
        const span = tracer.startSpan(`${path} ${method}`, {
          // attributes: getHooksAttributes(context),
        });
        await traceContext.with(trace.setSpan(traceContext.active(), span), () => next());
        span.end();
      },
    ]);

    app.mixins.push((service, path, serviceOptions) => {
      // Add first service hook
      service.hooks([
        async (context, next) => {
          const span = trace.getSpan(traceContext.active());
          span?.addEvent(`calling ${context.path} before hooks`);
          await next();
          span?.addEvent(`completed ${context.path} after hooks`);
        },
      ]);

      // Add first service 'after' (legacy) hook to trace when service call ends
      service.hooks({
        after: [(context) => {
          const span = trace.getSpan(traceContext.active());
          span?.addEvent(`completed ${context.path} ${context.method}`);
        }],
      });

      // Add last service 'before' (legacy) hook to trace start of service call
      const hooks = {
        before: [(context: HookContext) => {
          const span = trace.getSpan(traceContext.active());
          span?.addEvent(`calling ${context.path} ${context.method}`);
        }],
      };
      if (typeof service.setup === 'function') {
        shimmer.wrap(service, 'setup', function (original) {
          return function (this: any) {
            service.hooks(hooks);
            return original.apply(this, arguments as any);
          };
        });
      } else {
        Object.assign(service, {
          async setup() {
            service.hooks(hooks);
          },
        })
      }
    });
  }
}
