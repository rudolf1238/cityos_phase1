import { makeStyles } from '@material-ui/core/styles';
import React, { VoidFunctionComponent, memo } from 'react';

import AddRoundedIcon from '@material-ui/icons/AddRounded';
import Autocomplete from '@material-ui/lab/Autocomplete';
import CancelIcon from '@material-ui/icons/Cancel';
import SearchIcon from '@material-ui/icons/Search';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';

import { DeviceOption } from '../../../libs/type';
import useDashboardTranslation from '../../../hooks/useDashboardTranslation';

const useStyles = makeStyles((theme) => ({
  option: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },

  addIcon: {
    [theme.breakpoints.down('xs')]: {
      width: 28,
    },
  },

  clearIndicator: {
    visibility: 'visible',
    color: theme.palette.grey[300],

    '&:hover': {
      borderColor: 'transparent',
      backgroundColor: 'transparent',
    },

    '& .MuiSvgIcon-root': {
      color: theme.palette.grey[500],
    },
  },

  endAdornment: {
    top: 'initial',
  },

  popupIndicator: {
    display: 'none',
  },

  autocompleteListbox: {
    padding: 0,
    maxHeight: 160,
    overflowY: 'auto',
  },

  autocompleteOption: {
    minHeight: 56,
    [theme.breakpoints.down('xs')]: {
      padding: theme.spacing(2, 1),
    },
  },

  noOptions: {
    backgroundColor: theme.palette.background.container,
    color: theme.palette.text.secondary,
  },

  noOptionPaper: {
    border: `1px solid ${theme.palette.grey[100]}`,
    boxShadow: 'none',
  },
}));

interface DeviceSearchFieldProps {
  options: DeviceOption[];
  onChange: (option: DeviceOption | null) => void;
  inputValue: string;
}

const DeviceSearchField: VoidFunctionComponent<DeviceSearchFieldProps> = ({
  options,
  onChange,
  inputValue,
}: DeviceSearchFieldProps) => {
  const classes = useStyles();
  const { t } = useDashboardTranslation(['mainLayout', 'common']);

  return (
    <Autocomplete
      options={options}
      renderInput={(params) => (
        <TextField
          {...params}
          label={t('mainLayout:Device')}
          placeholder={t('common:Search')}
          type="text"
          variant="outlined"
          InputLabelProps={{
            ...params.InputLabelProps,
            shrink: true,
          }}
        />
      )}
      renderOption={(option) => (
        <div className={classes.option}>
          <Typography variant="body1">{option.label}</Typography>
          <AddRoundedIcon color="primary" fontSize="large" className={classes.addIcon} />
        </div>
      )}
      filterOptions={(newOption) => newOption}
      getOptionLabel={(option) => option.label}
      getOptionSelected={(option, value) => option.label === value.label}
      onChange={(_event, option) => {
        if (option) onChange(option);
      }}
      inputValue={inputValue}
      onInputChange={(_event, label, reason) => {
        // avoid initial value updated unexpectedly (the very first call to onInputChange sends "reset" as the reason, see https://github.com/mui/material-ui/issues/19423#issuecomment-639659875)
        if (reason === 'reset') return;
        onChange({ label: reason === 'clear' ? '' : label, value: '' });
      }}
      debug
      popupIcon={null}
      closeIcon={
        inputValue.length > 0 ? (
          <CancelIcon fontSize="small" color="disabled" />
        ) : (
          <SearchIcon titleAccess={t('common:Search')} fontSize="small" color="disabled" />
        )
      }
      fullWidth
      classes={{
        clearIndicator: classes.clearIndicator,
        endAdornment: classes.endAdornment,
        popupIndicator: classes.popupIndicator,
        listbox: classes.autocompleteListbox,
        option: classes.autocompleteOption,
        noOptions: classes.noOptions,
        paper: classes.noOptionPaper,
      }}
    />
  );
};

export default memo(DeviceSearchField);
