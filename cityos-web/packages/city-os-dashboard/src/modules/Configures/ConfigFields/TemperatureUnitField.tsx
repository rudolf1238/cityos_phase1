import { makeStyles } from '@material-ui/core/styles';
import React, { VoidFunctionComponent, memo, useCallback } from 'react';

import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormLabel from '@material-ui/core/FormLabel';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import Typography from '@material-ui/core/Typography';

import { TemperatureUnit } from '../../../libs/type';
import { isTemperatureUnit } from '../../../libs/validators';
import useDashboardTranslation from '../../../hooks/useDashboardTranslation';

const useStyles = makeStyles((theme) => ({
  layoutField: {
    border: `1px solid ${theme.palette.grey[300]}`,
    borderRadius: theme.shape.borderRadius,

    '&:focus-within': {
      border: `1px solid ${theme.palette.primary.main}`,
    },

    '& > legend': {
      marginLeft: theme.spacing(1),
      padding: theme.spacing(0, 0.5),
    },
  },

  radioGroup: {
    display: 'flex',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(4),
  },

  radio: {
    '&:hover': {
      borderColor: 'transparent',
    },
  },
}));

interface LayoutFieldProps {
  unit?: TemperatureUnit;
  onChange: (option: TemperatureUnit) => void;
}

const TemperatureUnitField: VoidFunctionComponent<LayoutFieldProps> = ({
  unit = TemperatureUnit.C,
  onChange,
}: LayoutFieldProps) => {
  const classes = useStyles();
  const { t } = useDashboardTranslation('dashboard');

  const handleChange = useCallback(
    (_event, value) => {
      const temperatureUnit = isTemperatureUnit(value) ? value : undefined;
      if (temperatureUnit) {
        onChange(temperatureUnit);
      }
    },
    [onChange],
  );

  return (
    <FormControl component="fieldset" fullWidth className={classes.layoutField}>
      <FormLabel component="legend">
        <Typography variant="caption">{t('Layout')}</Typography>
      </FormLabel>
      <RadioGroup
        row
        aria-label={t('Layout')}
        className={classes.radioGroup}
        onChange={handleChange}
        value={unit}
      >
        <FormControlLabel
          value={TemperatureUnit.C}
          control={
            <Radio
              color="primary"
              size="small"
              classes={{
                root: classes.radio,
              }}
            />
          }
          label={t('TEMPERATURE_C')}
        />
        <FormControlLabel
          value={TemperatureUnit.F}
          control={
            <Radio
              color="primary"
              size="small"
              classes={{
                root: classes.radio,
              }}
            />
          }
          label={t('TEMPERATURE_F')}
        />
      </RadioGroup>
    </FormControl>
  );
};

export default memo(TemperatureUnitField);
