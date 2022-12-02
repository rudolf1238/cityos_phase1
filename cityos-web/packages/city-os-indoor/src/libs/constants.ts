import { SplitMode } from './type';

export const splitModeColumnCount: Record<SplitMode, number> = {
  [SplitMode.SINGLE]: 1,
  [SplitMode.FOUR]: 2,
  [SplitMode.NINE]: 3,
  [SplitMode.SIXTEEN]: 4,
};
