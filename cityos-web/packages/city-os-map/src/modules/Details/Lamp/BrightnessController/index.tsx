import { makeStyles } from '@material-ui/core/styles';
import { useMutation } from '@apollo/client';
import React, { ChangeEvent, VoidFunctionComponent, useCallback, useEffect, useState } from 'react';

import Slider from '@material-ui/core/Slider';
import Typography from '@material-ui/core/Typography';

import { useStore } from 'city-os-common/reducers';

import OverwriteAlert from 'city-os-common/modules/OverwriteAlert';
import ReducerActionType from 'city-os-common/reducers/actions';

import {
  UPDATE_SENSOR,
  UpdateSensorPayload,
  UpdateSensorResponse,
} from '../../../../api/updateSensor';
import useMapTranslation from '../../../../hooks/useMapTranslation';

const useStyles = makeStyles((theme) => ({
  root: {
    position: 'relative',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.background.light,
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(5),
    width: theme.spacing(100),
    textAlign: 'center',

    [theme.breakpoints.down('md')]: {
      padding: theme.spacing(4),
      width: '100%',
    },
  },

  title: {
    margin: 'auto',
    width: theme.spacing(46),
  },

  slider: {
    paddingTop: theme.spacing(12),
    width: '50%',

    [theme.breakpoints.down('sm')]: {
      width: '60%',
    },

    [theme.breakpoints.down('xs')]: {
      width: '90%',
    },
  },
}));

const marks = [{ value: 20 }, { value: 40 }, { value: 60 }, { value: 80 }];

interface BrightnessSensor {
  deviceId: string;
  brightnessPercent: string | number;
}
interface BrightnessControllerProps {
  brightnessInputs: BrightnessSensor[];
  onChanged: () => void;
  onUpdating: (isUpdating: boolean) => void;
}

const BrightnessController: VoidFunctionComponent<BrightnessControllerProps> = ({
  brightnessInputs,
  onChanged,
  onUpdating,
}: BrightnessControllerProps) => {
  const { dispatch } = useStore();
  const { t } = useMapTranslation(['common', 'map', 'column']);
  const classes = useStyles();
  const [isConflict, setIsConflict] = useState(false);
  const [defaultValue, setDefaultValue] = useState(0);
  const [, setBrightness] = useState(0);

  const [updateSensor, { loading }] = useMutation<UpdateSensorResponse, UpdateSensorPayload>(
    UPDATE_SENSOR,
  );

  const onOverwrite = useCallback(() => {
    setIsConflict(false);
    setDefaultValue(0);
  }, []);

  const onSubmit = useCallback(
    async (_event: ChangeEvent<Record<string, unknown>>, value: number | number[]) => {
      if (typeof value !== 'number') return;
      if (!brightnessInputs) return;
      const updateResult = await Promise.allSettled(
        brightnessInputs.map(async ({ deviceId }) => {
          await updateSensor({
            variables: {
              deviceId,
              sensorId: 'setBrightnessPercent',
              value,
            },
          });
        }),
      );
      const rejectedResults = updateResult.filter((res) => res.status === 'rejected');
      if (rejectedResults.length === 0) {
        setBrightness(value);
        dispatch({
          type: ReducerActionType.ShowSnackbar,
          payload: {
            severity: 'success',
            message: t('common:The value has been set successfully_'),
          },
        });
        onChanged();
      } else {
        if (D_DEBUG) console.log(rejectedResults);
        dispatch({
          type: ReducerActionType.ShowSnackbar,
          payload: {
            severity: 'error',
            message: t('common:Failed to save_ Please try again_'),
          },
        });
      }
    },
    [brightnessInputs, dispatch, onChanged, t, updateSensor],
  );

  useEffect(() => {
    if (!brightnessInputs) return;
    const firstBrightness = brightnessInputs.find(
      ({ brightnessPercent }) => typeof brightnessPercent === 'number',
    );
    if (!firstBrightness) return;
    const isAllEqual = brightnessInputs.every(
      ({ brightnessPercent }) => brightnessPercent === firstBrightness.brightnessPercent,
    );
    if (isAllEqual && typeof firstBrightness.brightnessPercent === 'number') {
      setDefaultValue(firstBrightness.brightnessPercent);
    }
    setIsConflict(!isAllEqual);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brightnessInputs]);

  useEffect(() => {
    onUpdating(loading);
  }, [loading, onUpdating]);

  return (
    <div className={classes.root}>
      <Typography className={classes.title} variant="body1" align="left">
        {t('map:Adjust Brightness (%)')}
      </Typography>
      <Slider
        // add key to solve "Material-UI: A component is changing the default value state of an uncontrolled Slider after being initialized. To suppress this warning opt to use a controlled Slider."
        key={`slider-${defaultValue}`}
        aria-label={t('map:brightness slider')}
        valueLabelDisplay="on"
        marks={marks}
        defaultValue={defaultValue}
        onChangeCommitted={onSubmit}
        className={classes.slider}
      />
      <OverwriteAlert isOpen={isConflict} item={t('column:Brightness')} onClick={onOverwrite} />
    </div>
  );
};

export default BrightnessController;
