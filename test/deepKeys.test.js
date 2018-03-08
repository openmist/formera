import deepKeys from '../src/helpers/deepKeys';

// Todo: rename deepKeys to errorKeys?
describe('deepKeys', () => {
  it('can resolve both objects and arrays', () => {
    const resolve = {
      find: {
        thisDeep: {
          key: {
            but: [
              { also: 'these' },
              { and: 'this one' },
            ],
          },
        },
      },
    };

    expect(deepKeys(resolve)).toEqual([
      'find.thisDeep.key.but.0.also',
      'find.thisDeep.key.but.1.and',
    ]);
  });

  it('correctly resolves arrays', () => {
    const resolve = {
      deep: {
        deeper: {
          deepest: [
            'value',
            'another value',
            { a: 'third value' },
          ],
        },
      },
    };

    expect(deepKeys(resolve)).toEqual([
      'deep.deeper.deepest',
      'deep.deeper.deepest.2.a',
    ]);
  });
});
