import { makeStyles } from '@material-ui/core/styles';
import React, { VoidFunctionComponent, memo, useCallback } from 'react';

import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormLabel from '@material-ui/core/FormLabel';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import Typography from '@material-ui/core/Typography';

import { GadgetSize } from '../../../libs/type';
import { isGadgetSize } from '../../../libs/validators';
import useDashboardTranslation from '../../../hooks/useDashboardTranslation';

import RectangleIcon from '../../LayoutIcons/RectangleIcon';
import SelectedRectangleIcon from '../../LayoutIcons/SelectedRectangleIcon';
import SelectedSquareIcon from '../../LayoutIcons/SelectedSquareIcon';
import SquareIcon from '../../LayoutIcons/SquareIcon';

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
    paddingLeft: theme.spacing(4),

    '& > label': {
      paddingLeft: theme.spacing(3),
    },
  },

  radio: {
    '&:hover': {
      borderColor: 'transparent',
    },
  },
}));

interface LayoutFieldProps {
  size?: GadgetSize;
  onChange: (option: GadgetSize) => void;
}

const LayoutField: VoidFunctionComponent<LayoutFieldProps> = ({
  size = GadgetSize.SQUARE,
  onChange,
}: LayoutFieldProps) => {
  const classes = useStyles();
  const { t } = useDashboardTranslation('dashboard');

  const handleChange = useCallback(
    (_event, value) => {
      const gadgetSize = isGadgetSize(value) ? value : undefined;
      if (gadgetSize) {
        onChange(gadgetSize);
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
        value={size}
      >
        <FormControlLabel
          value={GadgetSize.SQUARE}
          control={
            <Radio
              color="primary"
              size="small"
              classes={{
                root: classes.radio,
              }}
            />
          }
          label={size === GadgetSize.SQUARE ? <SelectedSquareIcon /> : <SquareIcon />}
        />
        <FormControlLabel
          value={GadgetSize.RECTANGLE}
          control={
            <Radio
              color="primary"
              size="small"
              classes={{
                root: classes.radio,
              }}
            />
          }
          label={size === GadgetSize.RECTANGLE ? <SelectedRectangleIcon /> : <RectangleIcon />}
        />
      </RadioGroup>
    </FormControl>
  );
};

export default memo(LayoutField);
