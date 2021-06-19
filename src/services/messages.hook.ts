import { Application } from "@feathersjs/express";
import { HookOptions, Service } from "@feathersjs/feathers";
import { context as traceContext, trace } from '@opentelemetry/api';

import { Message } from './messages';

const hooks: HookOptions<Application, Service<Message>> = {
  before: {
    all: [async (context) => {
      const span = trace.getSpan(traceContext.active());
      span?.addEvent(`custom start event`, { query: 'test '});
      return context;
    }]
  },
  after: {
    all: [async (context) => {
      const span = trace.getSpan(traceContext.active());
      span?.addEvent(`custom end event`, { query: 'test '});
      return context;
    }],
  },
  error: {
  }
};

export default hooks;
