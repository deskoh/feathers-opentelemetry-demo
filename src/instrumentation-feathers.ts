import { diag, Span } from '@opentelemetry/api';
import {
  InstrumentationBase,
  InstrumentationConfig,
  InstrumentationNodeModuleDefinition,
} from '@opentelemetry/instrumentation';
import * as commons from '@feathersjs/commons';
import { HookContext } from "@feathersjs/feathers";

import { getHooksAttributes } from './utils';

const VERSION = '0.0.1';

declare module "@feathersjs/feathers" {
  interface HookContext<T = any, S = Service<T>> {
    span?: Span;
  }
}

export class FeathersInstrumentation extends InstrumentationBase {
  constructor(config: InstrumentationConfig = {}) {
    super('instrumentation-feathers', VERSION, config);
  }

  protected init() {
    const module = new InstrumentationNodeModuleDefinition<typeof commons>(
      '@feathersjs/commons',
      ['4.*'],
       this._onPatchMain.bind(this),
       this._onUnPatchMain.bind(this),
    );

    return module;
  }

  private _onPatchMain(moduleExports: typeof commons) {
    diag.debug(`Applying patch for @feathersjs/commons`);
    this._wrap(
      moduleExports.hooks,
      'processHooks',
      this._patchMainMethodName(),
    );
    return moduleExports;
  }

  private _onUnPatchMain(moduleExports: typeof commons) {
    diag.debug(`Removing patch for @feathersjs/commons`);
    this._unwrap(moduleExports.hooks, 'processHooks');
  }

  // Reference: packages/commons/src/hooks.ts@processHooks
  private _patchMainMethodName(): (original: any) => any {
    const plugin = this;
    return function mainMethodName(original) {
      return function patchMainMethodName(this: any, ...args: any): any {

        const [originalHooks, hookObject]: [any[], HookContext] = args;
        if (hookObject.type === 'before') {
          const span = plugin.tracer.startSpan(`${hookObject.path} ${hookObject.method}`);
          hookObject.span = span;
          // propagation.extract(context.active(), hookObject.params?.headers);
          return original.apply(this, args).then((hookObject: any) => {
            span.addEvent(`before hooks completed`);
            return hookObject;
          });
        } else if (hookObject.type === 'after') {
          // Determine after or finally hooks
          if (!(hookObject as any)._spanAfterCompleted) {
            // hookObject.params only available after method completes.
            hookObject.span?.setAttributes(getHooksAttributes(hookObject));
            return original.apply(this, args).then((hookObject: any) => {
              hookObject.span.addEvent(`after hooks completed`);
              hookObject._spanAfterCompleted = true;
              return hookObject;
            });
          } else {
            return original.apply(this, args).then((hookObject: any) => {
              hookObject.span.end();
              return hookObject;
            });
          }
        }

        return original.apply(this, args);
      };
    };
  }
}

