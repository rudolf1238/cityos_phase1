import mapValues from 'lodash/mapValues';
import omit from 'lodash/omit';

import { isArray, isObject } from './validators';

type Primitive = string | number | boolean | symbol | undefined | null;

// eslint-disable-next-line @typescript-eslint/ban-types
export type OmitTypenameDeep<T> = T extends Primitive | Function
  ? T
  : T extends unknown[]
  ? {
      [P in keyof T]: OmitTypenameDeep<T[P]>;
    }
  : {
      [P in Exclude<keyof T, '__typename'>]: OmitTypenameDeep<T[P]>;
    };

const omitTypenameDeep = <T>(value: T): OmitTypenameDeep<T> => {
  if (isArray(value)) {
    return value.map((v) => omitTypenameDeep(v)) as OmitTypenameDeep<T>;
  }
  if (isObject(value)) {
    return mapValues(omit(value, '__typename'), omitTypenameDeep) as OmitTypenameDeep<T>;
  }

  return value as OmitTypenameDeep<T>;
};

export default omitTypenameDeep;
