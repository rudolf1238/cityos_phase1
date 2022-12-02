import format from 'date-fns/format';
import i18n from 'i18next';
import set from 'date-fns/set';

import { localesMap } from './i18n';

export default function formatDate(
  date: number | Date | Parameters<typeof set>[1],
  formatStr: string,
  options?: Omit<Exclude<Parameters<typeof format>[2], undefined>, 'locale'>,
): string {
  const newDate = typeof date === 'number' || date instanceof Date ? date : set(new Date(), date);
  const locale = localesMap?.[i18n.language] || localesMap.default;

  return format(newDate, formatStr, { ...options, locale });
}
