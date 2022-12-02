import { SplitMode } from './type';

export const isSplitMode = (value: unknown): value is SplitMode =>
  Object.values<unknown>(SplitMode).includes(value);
