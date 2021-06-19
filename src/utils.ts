import { HookContext } from '@feathersjs/feathers';
import { SpanAttributes } from '@opentelemetry/api';
import { SemanticAttributes } from '@opentelemetry/semantic-conventions';

export const getHooksAttributes = (
  context: HookContext,
): SpanAttributes => {
  const { params = {} } = context;
  const attributes: SpanAttributes = {
    [SemanticAttributes.MESSAGING_OPERATION]: context.method,
    [SemanticAttributes.MESSAGING_PROTOCOL]: params.provider,
    [SemanticAttributes.HTTP_USER_AGENT]: params.headers?.['user-agent'],
  };

  return attributes;
};
