import { useCallback } from 'react';

import { Gender } from '../libs/schema';
import useCommonTranslation from './useCommonTranslation';

interface UseGenderTranslationResponse extends Omit<ReturnType<typeof useCommonTranslation>, 't'> {
  tGender: (gender: Gender) => string;
}

const useGenderTranslation = (): UseGenderTranslationResponse => {
  const { t, ...methods } = useCommonTranslation('common');

  const tGender = useCallback(
    (type: Gender) => {
      const mapping: Record<Gender, string> = {
        [Gender.FEMALE]: t('Female'),
        [Gender.MALE]: t('Male'),
      };
      return mapping[type];
    },
    [t],
  );

  return {
    ...methods,
    tGender,
  };
};

export default useGenderTranslation;
