import { HookContext, HooksObject } from "@feathersjs/feathers";

const hooks: HooksObject = {
  before: {
    all: [async (context: HookContext) => {
      context.span?.addEvent(`custom start event`, { query: 'test '});
      return context;
    }]
  },
  after: {
    all: [async (context: HookContext) => {
      context.span?.addEvent(`custom end event`, { query: 'test '});
      return context;
    }],
  },
  error: {
  }
};

export default hooks;
