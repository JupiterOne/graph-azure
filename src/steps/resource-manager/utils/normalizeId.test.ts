import { normalizeId } from './normalizeId';

describe('when normalizing an Id with a leading slash', () => {
  it('should return an id with a leading slash', () => {
    expect(normalizeId('/id')).toBe('/id');
  });
});

describe('when normalizing an Id without a leading slash', () => {
  it('should return an id with a leading slash', () => {
    expect(normalizeId('id')).toBe('/id');
  });
});

describe('when normalizing an undefined Id', () => {
  it('should return the original id', () => {
    expect(normalizeId(undefined)).toBe(undefined);
  });
});
