export function createTextFixture(value = 'EZ-MEAL') {
  return {
    value,
    normalized: value.trim().toLowerCase(),
  };
}
