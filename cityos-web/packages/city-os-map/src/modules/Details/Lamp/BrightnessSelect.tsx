import { makeStyles } from '@material-ui/core/styles';
import React, { ChangeEvent, VoidFunctionComponent, useCallback } from 'react';

import ExpandMoreRoundedIcon from '@material-ui/icons/ExpandMoreRounded';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';

const optionsBase10 = Array.from({ length: 11 }, (_, i) => i * 10);
const optionsBase20 = Array.from({ length: 6 }, (_, i) => i * 20);

const useStyles = makeStyles((theme) => ({
  root: {
    textAlign: 'left',
  },

  popover: {
    marginTop: theme.spacing(2),
  },

  menu: {
    marginTop: theme.spacing(2),
  },

  menuList: {
    padding: 0,
  },

  placeholder: {
    display: 'none',
  },
}));

interface BrightnessSelectProps {
  label: string;
  value: number | undefined;
  baseNumber?: 10 | 20;
  onSelect: (value: number) => void;
}

const BrightnessSelect: VoidFunctionComponent<BrightnessSelectProps> = ({
  label,
  value: brightness,
  baseNumber,
  onSelect,
}: BrightnessSelectProps) => {
  const classes = useStyles();

  const handleBrightnessChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
      onSelect(+e.target.value);
    },
    [onSelect],
  );

  return (
    <TextField
      onChange={handleBrightnessChange}
      className={classes.root}
      value={brightness === undefined ? '-' : brightness}
      variant="outlined"
      type="text"
      select
      label={label}
      fullWidth
      InputLabelProps={{ shrink: true }}
      SelectProps={{
        IconComponent: ExpandMoreRoundedIcon,
        MenuProps: {
          getContentAnchorEl: null,
          anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
          className: classes.menu,
          MenuListProps: {
            className: classes.menuList,
          },
          PaperProps: {
            variant: 'outlined',
          },
          PopoverClasses: {
            root: classes.popover,
          },
        },
      }}
    >
      <MenuItem key="brightness-placeholder" value="-" className={classes.placeholder}>
        -
      </MenuItem>
      {(baseNumber === 10 ? optionsBase10 : optionsBase20).map((option) => (
        <MenuItem key={`brightness-${option}`} value={option}>
          {option}%
        </MenuItem>
      ))}
    </TextField>
  );
};
export default BrightnessSelect;
