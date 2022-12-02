import { useCallback } from 'react';

import { Color } from '../libs/type';
import useEventsTranslation from './useEventsTranslation';

interface UseColorTranslationResponse extends Omit<ReturnType<typeof useEventsTranslation>, 't'> {
  tColor: (Color: Color) => string;
}

const useColorTranslation = (): UseColorTranslationResponse => {
  const { t, ...methods } = useEventsTranslation('events');

  const tColor = useCallback(
    (type: Color) => {
      const mapping: Record<Color, string> = {
        [Color.WHITE]: t('White'),
        [Color.BLACK]: t('Black'),
        [Color.SILVER]: t('Silver'),
        [Color.RED]: t('Red'),
        [Color.GREEN]: t('Green'),
        [Color.YELLOW]: t('Yellow'),
        [Color.BLUE]: t('Blue'),
        [Color.PURPLE]: t('Purple'),
      };
      return mapping[type];
    },
    [t],
  );

  return {
    ...methods,
    tColor,
  };
};

export default useColorTranslation;
