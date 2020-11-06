import flatten from './flatten';

describe('flatten', () => {
  describe('when flattening an object with a boolean prop', () => {
    it('should return an object with the same boolean prop', () => {
      expect(flatten({ a: true })).toEqual({ a: true });
    });
  });

  describe('when flattening an object with a number prop', () => {
    it('should return an object with the same number prop', () => {
      expect(flatten({ a: 1 })).toEqual({ a: 1 });
    });
  });

  describe('when flattening an object with a string prop that should be parsed into a primitive', () => {
    it('should return an object with the parsed string prop', () => {
      expect(flatten({ a: 'true' }, { parseString: true })).toEqual({
        a: true,
      });
    });
  });

  describe('when flattening an object with a time prop', () => {
    it('should return an object with the parsed time prop', () => {
      const now = new Date();

      expect(
        flatten({ created_at: now.toISOString() }, { parseTime: true }),
      ).toEqual({ created_at: now.getTime() });
    });
  });

  describe('when flattening an object with an unparsable time prop', () => {
    it('should return an object with the prop set to the original value', () => {
      expect(flatten({ created_at: 'abc' }, { parseTime: true })).toEqual({
        created_at: 'abc',
      });
    });
  });

  describe('when flattening an object with a falsy prop', () => {
    it('should return an object with the falsy prop removed from the result', () => {
      expect(flatten({ a: undefined })).toEqual({});
    });
  });

  describe('when flattening an object with an empty array', () => {
    it('should return an object with the empty array removed from the result', () => {
      expect(flatten({ a: [] })).toEqual({});
    });
  });

  describe('when flattening an object with a string prop that should not be parsed into a primitive', () => {
    it('should return an object with the unparsed string prop ', () => {
      expect(flatten({ a: 'true' }, { parseString: false })).toEqual({
        a: 'true',
      });
    });
  });

  describe('when flattening an object with a array prop that should be stringified', () => {
    it('should return an object with the stringified array prop ', () => {
      const arr = [1, 2, 3];

      expect(flatten({ a: arr }, { stringifyArray: true })).toEqual({
        a: JSON.stringify(arr),
      });
    });
  });

  describe('when flattening an object with a object prop that should be stringified', () => {
    it('should return an object with the stringified object prop ', () => {
      const nested = { b: 1, c: 2, d: 3 };

      expect(flatten({ a: nested }, { stringifyObject: true })).toEqual({
        a: JSON.stringify(nested),
      });
    });
  });

  describe('when flattening a nested object that should not be stringified', () => {
    it('should return an object with the stringified object prop ', () => {
      const nested = { a: { b: { c: { d: 'e' } } } };

      expect(flatten(nested)).toEqual({ 'a.b.c.d': 'e' });
    });
  });

  describe("when flattening a nested object that has a 'value' key", () => {
    it('should return an object with value key removed ', () => {
      const nested = { a: { b: { c: { value: 'e' } } } };

      expect(flatten(nested)).toEqual({ 'a.b.c': 'e' });
    });
  });

  describe('when flattening an object with a array prop that should be not stringified', () => {
    it('should return an object with the flattened array prop ', () => {
      expect(
        flatten({
          a: [{ b: 1 }, 'true', { c: { d: 2 } }, 3],
        }),
      ).toEqual({
        a: [{ b: 1 }, 'true', { 'c.d': 2 }, 3],
      });
    });
  });

  describe('when flattening an object with an array with objects that should be stringified', () => {
    it('should return an object with the stringified array prop ', () => {
      const arr = [{ b: 1 }, { c: { d: 2 } }, { e: { f: { g: 3 } } }];

      expect(flatten({ a: arr }, { stringifyObject: true })).toEqual({
        a: ['{"b":1}', '{"c":{"d":2}}', '{"e":{"f":{"g":3}}}'],
      });
    });
  });

  describe('when flattening undefined', () => {
    it('should return undefined', () => {
      expect(flatten(undefined)).toEqual(undefined);
    });
  });

  describe('when flattening null', () => {
    it('should return null', () => {
      expect(flatten(null)).toEqual(null);
    });
  });

  describe('when flattening any non-object', () => {
    it('should return the same value', () => {
      expect(flatten(1)).toEqual(1);
      expect(flatten('hello, world')).toEqual('hello, world');
    });
  });

  describe('when flattening an object with a null property', () => {
    it('should return an object with that null property', () => {
      expect(flatten({ a: null })).toEqual({ a: null });
    });
  });

  describe('when flattening a complex object', () => {
    it('should return a flattened object', () => {
      expect(
        flatten(
          {
            date_time: '2020-10-27T21:16:27.872Z',
            a: 'true',
            b: '1',
            c: { d: { e: { value: 'f' } } },
            g: false,
            h: ['false', '2', { i: { j: 'k', l: 'm' } }],
          },
          { parseString: true, parseTime: true },
        ),
      ).toEqual({
        date_time: 1603833387872,
        a: true,
        b: 1,
        'c.d.e': 'f',
        g: false,
        h: [false, 2, { 'i.j': 'k', 'i.l': 'm' }],
      });
    });
  });
});
