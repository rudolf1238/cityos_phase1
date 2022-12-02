import { makeStyles } from '@material-ui/core/styles';
import React, { VoidFunctionComponent, useEffect, useState } from 'react';
import clsx from 'clsx';

import Autocomplete from '@material-ui/lab/Autocomplete';
import CancelIcon from '@material-ui/icons/Cancel';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import SearchIcon from '@material-ui/icons/Search';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';

import useCommonTranslation from '../hooks/useCommonTranslation';

const useStyles = makeStyles((theme) => ({
  endAdornment: {
    top: 'initial',
  },

  popupIndicator: {
    display: 'none',
  },

  autocompleteListbox: {
    padding: 0,
    maxHeight: theme.spacing(20),
    overflowY: 'auto',
  },

  autocompleteOption: {
    height: theme.spacing(7),
  },

  noOptions: {
    backgroundColor: theme.palette.grey[50],
  },

  noOptionPaper: {
    border: `1px solid ${theme.palette.grey[100]}`,
    boxShadow: 'none',
  },

  textField: {
    marginRight: theme.spacing(2),
    width: theme.spacing(45),
  },

  iconWrapper: {
    position: 'absolute',
    right: 0,
    color: theme.palette.text.disabled,

    '&:hover': {
      borderColor: 'transparent',
      backgroundColor: 'transparent',
    },
  },

  searchIcon: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(1.5),
  },
}));

interface AutocompleteFieldProps {
  label: string;
  placeholder?: string;
  noOptionText?: string;
  options: string[];
  value?: string | null;
  onChange: (keyword: string | null) => void;
}

const AutocompleteField: VoidFunctionComponent<AutocompleteFieldProps> = ({
  label,
  placeholder = '',
  noOptionText,
  options,
  value,
  onChange,
}: AutocompleteFieldProps) => {
  const { t } = useCommonTranslation('common');
  const classes = useStyles();
  const [isSearchShow, setIsSearchShow] = useState(false);
  const [isClearShow, setIsClearShow] = useState(false);

  useEffect(() => {
    if (value) {
      setIsClearShow(true);
      return;
    }
    setIsClearShow(false);
  }, [value]);

  return (
    <Autocomplete
      options={options}
      classes={{
        endAdornment: classes.endAdornment,
        popupIndicator: classes.popupIndicator,
        listbox: classes.autocompleteListbox,
        option: classes.autocompleteOption,
        noOptions: classes.noOptions,
        paper: classes.noOptionPaper,
      }}
      onChange={(event, option) => onChange(option)}
      onOpen={() => setIsSearchShow(true)}
      onClose={() => setIsSearchShow(false)}
      popupIcon={null}
      noOptionsText={noOptionText && <Typography variant="body1">{noOptionText}</Typography>}
      value={value}
      renderInput={(params) => (
        <TextField
          {...params}
          required
          label={label}
          type="text"
          variant="outlined"
          placeholder={placeholder}
          classes={{
            root: classes.textField,
          }}
          InputLabelProps={{
            ...params.InputLabelProps,
            shrink: true,
          }}
          InputProps={{
            ...params.InputProps,
            endAdornment: isClearShow ? (
              <InputAdornment position="end">
                <IconButton
                  aria-label={t('Clear')}
                  className={classes.iconWrapper}
                  onClick={() => onChange(null)}
                >
                  <CancelIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ) : (
              isSearchShow && (
                <InputAdornment
                  position="end"
                  className={clsx(classes.iconWrapper, classes.searchIcon)}
                >
                  <SearchIcon titleAccess={t('Search')} fontSize="small" />
                </InputAdornment>
              )
            ),
          }}
        />
      )}
    />
  );
};

export default AutocompleteField;
