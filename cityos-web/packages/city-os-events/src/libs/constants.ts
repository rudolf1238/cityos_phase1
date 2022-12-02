import { Palette } from '@material-ui/core/styles/createPalette';

import { Color } from './type';

export const defaultColors: Record<Color, keyof Palette['gadget']> = {
  [Color.WHITE]: 'paper',
  [Color.BLACK]: 'dark',
  [Color.SILVER]: 'reserved',
  [Color.RED]: 'alarm',
  [Color.GREEN]: 'default',
  [Color.YELLOW]: 'energyStop',
  [Color.BLUE]: 'available',
  [Color.PURPLE]: 'charging',
};

export const minPerClip = 10;
