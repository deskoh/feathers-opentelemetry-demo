import { diag, context as traceContext, trace } from '@opentelemetry/api';
import {
  InstrumentationBase,
  InstrumentationConfig,
  InstrumentationNodeModuleDefinition,
} from '@opentelemetry/instrumentation';
import * as feathers from '@feathersjs/feathers/lib/hooks/legacy';
import { collectLegacyHooks } from '@feathersjs/feathers/lib/hooks/legacy';
import { Middleware } from '@feathersjs/hooks';

import { getHooksAttributes } from './utils';

const VERSION = '0.0.1';

export class FeathersInstrumentation extends InstrumentationBase {
  constructor(config: InstrumentationConfig = {}) {
    super('instrumentation-feathers', VERSION, config);
  }

  protected init() {
    const module = new InstrumentationNodeModuleDefinition<typeof feathers>(
      '@feathersjs/feathers/lib/hooks/legacy',
      ['5.0.0-pre.4'],
      this._onPatchFeathers.bind(this),
      this._onUnPatchFeathers.bind(this),
    );

    return module;
  }

  private _onPatchFeathers(moduleExports: typeof feathers) {
    diag.debug(`Applying patch for @feathersjs/feathers`);
    this._wrap(
      moduleExports,
      'collectLegacyHooks',
      this._patchCollectLegacyHooks(),
    );
    return moduleExports;
  }

  private _onUnPatchFeathers(moduleExports: typeof feathers) {
    diag.debug(`Removing patch for @feathersjs/feathers`);
    this._unwrap(moduleExports, 'collectLegacyHooks');
  }

  // Reference: feathers\src\hooks\legacy.ts
  private _patchCollectLegacyHooks(): (original: typeof collectLegacyHooks) => any {
    const plugin = this;
    return function collectLegacyHooks(original) {
      const appTraceMiddleware: Middleware = async (context, next) => {
        const { path, method } = context;
        const span = plugin.tracer.startSpan(`${path} ${method}`, {
          attributes: getHooksAttributes(context),
        });
        await traceContext.with(trace.setSpan(traceContext.active(), span), () => next());
        span.end();
      };

      const appMiddleware: Middleware = async (context, next) => {
        const span = trace.getSpan(traceContext.active());
        span?.addEvent(`completed app before hooks`);
        await next();
        span?.addEvent(`calling app after hooks`);
      };
      const serviceMiddleware: Middleware = async (context, next) => {
        const span = trace.getSpan(traceContext.active());
        span?.addEvent(`completed service before hooks`);
        await next();
        span?.addEvent(`calling service after hooks`);
      };
      return function patchCollectLegacyHooks(this: any, ...args: any) {
        const legacyHooks = original.apply(this, args);

        const isCollectingAppHooks = (args[0].constructor.name === 'EventEmitter');
        return isCollectingAppHooks ?
          [appTraceMiddleware, ...legacyHooks, appMiddleware] :
          [...legacyHooks, serviceMiddleware];
      };
    };
  }
}

