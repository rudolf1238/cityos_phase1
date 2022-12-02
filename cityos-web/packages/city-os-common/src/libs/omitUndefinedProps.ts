import isUndefined from 'lodash/isUndefined';
import omitBy from 'lodash/omitBy';
import type { Dictionary } from 'lodash';

export default function omitUndefinedProps<T extends Dictionary<unknown>>(props: T) {
  return omitBy(props, isUndefined);
}
