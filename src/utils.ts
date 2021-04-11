import { HookContext } from '@feathersjs/feathers';
import { SpanAttributes } from '@opentelemetry/api';
import { MessagingAttribute, HttpAttribute } from '@opentelemetry/semantic-conventions';

export const getHooksAttributes = (
  context: HookContext,
): SpanAttributes => {
  const { params = {} } = context;
  const attributes: SpanAttributes = {
    [MessagingAttribute.MESSAGING_OPERATION]: context.method,
    [MessagingAttribute.MESSAGING_PROTOCOL]: params.provider,
    [HttpAttribute.HTTP_USER_AGENT]: params.headers?.['user-agent'],
  };

  return attributes;
};
