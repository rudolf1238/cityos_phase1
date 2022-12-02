import { useCallback } from 'react';

import { RecognitionType } from 'city-os-common/libs/schema';

import useEventsTranslation from './useEventsTranslation';

interface UseRecognitionTypeTranslationResponse
  extends Omit<ReturnType<typeof useEventsTranslation>, 't'> {
  tRecognitionType: (recognitionType: RecognitionType) => string;
}

const useRecognitionTypeTranslation = (): UseRecognitionTypeTranslationResponse => {
  const { t, ...methods } = useEventsTranslation('events');

  const tRecognitionType = useCallback(
    (type: RecognitionType) => {
      const mapping: Record<RecognitionType, string> = {
        [RecognitionType.HUMAN_FLOW]: t('Crowd'),
        [RecognitionType.HUMAN_FLOW_ADVANCE]: t('People flow'),
        [RecognitionType.HUMAN_SHAPE]: t('People locator'),
        [RecognitionType.CAR_FLOW]: t('Traffic flow'),
        [RecognitionType.CAR_IDENTIFY]: t('Car plate'),
      };
      return mapping[type];
    },
    [t],
  );

  return {
    ...methods,
    tRecognitionType,
  };
};

export default useRecognitionTypeTranslation;
