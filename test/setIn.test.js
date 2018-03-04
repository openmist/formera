import setIn from '../src/helpers/setIn';

describe('setIn', () => {
  it('sets deep', () => {
    const original = {
      deep: {
        unchanged: true,
        nested: {
          with: 'values',
        },
      },
    };

    const expected = {
      deep: {
        unchanged: true,
        nested: {
          with: 'values',
          other: 'values',
        },
      },
    };

    expect(setIn('deep.nested.other', 'values', original)).toEqual(expected);
  });

  it('deletes keys with undefined value', () => {
    const original = {
      deep: {
        deeper: {
          deepest: {
            removable: 'this key should be removed',
            unchanged: true,
          },
        },
      },
    };

    const expected = {
      deep: {
        deeper: {
          deepest: {
            unchanged: true,
          },
        },
      },
    };

    expect(setIn('deep.deeper.deepest.removable', undefined, original)).toEqual(expected);
  });

  it('clears the whole object if no keys should be set', () => {
    const original = {
      deep: {
        deeper: {
          deepest: {
            deepester: {
              removable: true,
            },
          },
        },
      },
    };

    const expected = {};

    expect(setIn('deep.deeper.deepest.deepester.removable', undefined, original)).toEqual(expected);
  });

  it('only clears relevant parts of the object', () => {
    const original = {
      deep: {
        deeper: {
          deepest: {
            leave: 'this',
            deepester: {
              removable: true,
            },
          },
        },
      },
    };

    const expected = {
      deep: {
        deeper: {
          deepest: {
            leave: 'this',
          },
        },
      },
    };

    expect(setIn('deep.deeper.deepest.deepester.removable', undefined, original, true)).toEqual(expected);
  });

  it('sets in array correctly', () => {
    let original = {
      test: [],
    };

    const expected = {
      test: [
        'one',
        'two',
        'three',
      ],
    };

    original = setIn('test.1', 'two', original);
    original = setIn('test.0', 'one', original);
    original = setIn('test.2', 'three', original);

    expect(original).toEqual(expected);
  });
});
