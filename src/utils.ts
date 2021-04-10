import { HookContext } from '@feathersjs/feathers';
import { SpanAttributes } from '@opentelemetry/api';
import { MessagingAttribute } from '@opentelemetry/semantic-conventions';

export const getHooksAttributes = (
  hookObject: HookContext,
  // options: { component: string; hostname: string }
): SpanAttributes => {
  const attributes: SpanAttributes = {
    [MessagingAttribute.MESSAGING_OPERATION]: hookObject.method,
    [MessagingAttribute.MESSAGING_PROTOCOL]: hookObject.params?.provider,
  };

  return attributes;
};
