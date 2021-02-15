import {
  parseStringPropertyValue,
  parseTimePropertyValue,
} from '@jupiterone/integration-sdk-core/dist/src/data/converters';

export type FlattenObjectOptions = {
  /**
   * Convert `Object` properties using `JSON.stringify(value)`. Without this
   * option, `Object` properties are not transferred.
   */
  stringifyObject?: boolean;

  /**
   * Convert `Array` properties using `JSON.stringify(value)`. Without this
   * option, `Array` properties are not transferred.
   */
  stringifyArray?: boolean;

  /**
   * Parse primitive properties (string, boolean, number). Without this
   * option, values are transferred as-is.
   */
  parseString?: boolean;

  /**
   * Parse properties that are named with date/time-like suffixes into number of
   * milliseconds since epoch (UNIX timestamp).
   */
  parseTime?: boolean;
};

const TIME_PROPERTY_NAMES = /^\w+((T|_t)ime|(O|_o)n|(A|_a)t|(D|_d)ate)$/;
function isTimeProperty(property: string): boolean {
  return TIME_PROPERTY_NAMES.test(property);
}

type ConversionStrategy = {
  canConvert: (
    key: string,
    value: any,
    options: FlattenObjectOptions,
  ) => boolean;
  convert: (key: string, value: any, options: FlattenObjectOptions) => any;
};

const conversionStrategies: ConversionStrategy[] = [
  {
    canConvert: (key, value, _) => value === null,
    convert: (key, value, _) => value,
  },
  {
    canConvert: (key, value, _) =>
      typeof value === 'boolean' || typeof value === 'number',
    convert: (key, value, _) => value,
  },
  {
    canConvert: (key, value, options) =>
      !!(typeof value === 'string' && options.parseTime && isTimeProperty(key)),
    convert: (key, value, _) => {
      const time = parseTimePropertyValue(value);
      return time || value;
    },
  },
  {
    canConvert: (key, value, options) =>
      !!(typeof value === 'string' && options.parseString),
    convert: (key, value, _) => parseStringPropertyValue(value),
  },
  {
    canConvert: (key, value, _) => typeof value === 'string',
    convert: (key, value, _) => value,
  },
  {
    canConvert: (key, value, options) =>
      !!(Array.isArray(value) && options.stringifyArray) ||
      !!(
        options.stringifyObject &&
        !Array.isArray(value) &&
        typeof value === 'object'
      ),
    convert: (key, value, _) => JSON.stringify(value),
  },
  {
    canConvert: (_, value, options) =>
      Array.isArray(value) && !options.stringifyArray,
    convert: (key, value, options) => {
      if (!value || value.length < 1) return undefined;

      return value.map((v) => {
        const strategy = getConversionStrategy('', v, options);

        if (strategy) {
          return strategy.convert(key, v, options);
        } else {
          return flatten(v, options);
        }
      });
    },
  },
];

function getConversionStrategy(
  key: string,
  value: any,
  options: FlattenObjectOptions,
): any {
  return conversionStrategies.find((cs) => cs.canConvert(key, value, options));
}

// TODO needs docstrings
export default function flatten(
  obj: any, // If this is used at runtime against a returned property from a client, it maybe used against something someone expects to be an object, but is not
  options: FlattenObjectOptions = {},
  currentKey: string = '',
): any {
  return obj && typeof obj === 'object'
    ? Object.entries(obj).reduce((flattened, [key, value]) => {
        const newKey = !currentKey
          ? key
          : key === 'value'
          ? currentKey
          : `${currentKey}.${key}`;

        if (value !== undefined) {
          const strategy = getConversionStrategy(key, value, options);

          if (strategy) {
            const convertedValue = strategy.convert(key, value, options);

            if (convertedValue !== undefined) {
              flattened[newKey] = convertedValue;
            }
          } else {
            flattened = {
              ...flattened,
              ...flatten(value, options, newKey),
            };
          }
        }

        return flattened;
      }, {})
    : obj;
}
