import { useCallback } from 'react';

import { CarModel } from '../libs/type';
import useEventsTranslation from './useEventsTranslation';

interface UseCarModelTranslationResponse
  extends Omit<ReturnType<typeof useEventsTranslation>, 't'> {
  tCarModel: (CarModel: CarModel) => string;
}

const useCarModelTranslation = (): UseCarModelTranslationResponse => {
  const { t, ...methods } = useEventsTranslation('events');

  const tCarModel = useCallback(
    (type: CarModel) => {
      const mapping: Record<CarModel, string> = {
        [CarModel.CAR]: t('Car'),
        [CarModel.MOTOR]: t('Motor bike'),
        [CarModel.TRUCK]: t('Truck'),
      };
      return mapping[type];
    },
    [t],
  );

  return {
    ...methods,
    tCarModel,
  };
};

export default useCarModelTranslation;
