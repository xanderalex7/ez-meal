import { createTextFixture } from '../builders';

describe('createTextFixture', () => {
  it('normalizes a text fixture for tests', () => {
    expect(createTextFixture('  EZ-MEAL  ')).toEqual({
      value: '  EZ-MEAL  ',
      normalized: 'ez-meal',
    });
  });
});
