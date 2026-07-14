import { toSafeUserMessage } from '../../shared/errors';
import { redactContext } from '../../shared/logging';

describe('errors and logging', () => {
  it('returns safe user messages without stack traces', () => {
    expect(
      toSafeUserMessage({
        code: 'PERSISTENCE_ERROR',
        message: 'I dati locali non sono disponibili.',
      }),
    ).toBe('I dati locali non sono disponibili.');
    expect(toSafeUserMessage(new Error('SQL failed at /tmp/db'))).toBe(
      'Si è verificato un problema. Riprova.',
    );
  });

  it('redacts sensitive logging context keys', () => {
    expect(
      redactContext({
        token: 'abc',
        userCount: 2,
        passwordHash: 'hash',
        secretValue: 'secret',
      }),
    ).toEqual({
      token: '[REDACTED]',
      userCount: 2,
      passwordHash: '[REDACTED]',
      secretValue: '[REDACTED]',
    });
  });
});
