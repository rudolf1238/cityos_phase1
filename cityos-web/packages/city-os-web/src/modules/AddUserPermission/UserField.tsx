import { makeStyles } from '@material-ui/core/styles';
import React, { MouseEvent, VoidFunctionComponent, useCallback } from 'react';

import AddRoundedIcon from '@material-ui/icons/AddRounded';
import Autocomplete from '@material-ui/lab/Autocomplete';
import Button from '@material-ui/core/Button';
import CancelIcon from '@material-ui/icons/Cancel';
import Card from '@material-ui/core/Card';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';

import { PossibleUsersResponse } from 'city-os-common/api/possibleUsers';

import useWebTranslation from '../../hooks/useWebTranslation';

const useStyles = makeStyles((theme) => ({
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
    height: 56,
  },

  noOptions: {
    backgroundColor: theme.palette.background.container,
    color: theme.palette.text.secondary,
  },

  noOptionPaper: {
    border: `1px solid ${theme.palette.grey[100]}`,
    boxShadow: 'none',
  },

  inviteButton: {
    textTransform: 'none',
  },

  nameCard: {
    display: 'flex',
    position: 'relative',
    flexDirection: 'column',
    gap: theme.spacing(0.25),
    justifyContent: 'center',
    border: `1px solid ${theme.palette.grey[300]}`,
    padding: theme.spacing(0.5, 2, 0),
    height: 56,
    overflow: 'visible',
  },

  nameCardLabel: {
    position: 'absolute',
    top: 0,
    left: 0,
    transform: 'translate(-6px, -10px) scale(0.75)',
    background: theme.palette.background.paper,
    paddingRight: theme.spacing(1),
    paddingLeft: theme.spacing(1),
    color: theme.palette.grey[600],
  },

  option: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0.25),
    justifyContent: 'center',
  },

  optionText: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
}));

interface UserFieldProps {
  inputLabel: string;
  placeholder: string;
  possibleUsers: PossibleUsersResponse['possibleUsers'] | null;
  emailValue: string;
  emailName: string | null;
  newOptionValid: boolean;
  hasNewOption: boolean;
  classes?: { textField?: string };
  changeEmail: (option: { name: string | null; email: string }) => void;
  setHasNewOption: (prev: boolean) => void;
}

const UserField: VoidFunctionComponent<UserFieldProps> = ({
  inputLabel,
  placeholder,
  possibleUsers,
  emailValue,
  emailName,
  newOptionValid,
  hasNewOption,
  classes: customClasses,
  changeEmail,
  setHasNewOption,
}: UserFieldProps) => {
  const { t } = useWebTranslation('user');
  const classes = useStyles();

  const inviteButtonOnClick = useCallback(() => {
    setHasNewOption(true);
  }, [setHasNewOption]);

  const cardOnClick = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      event.stopPropagation();
      setHasNewOption(false);
    },
    [setHasNewOption],
  );

  return (
    <Autocomplete
      inputValue={emailName || emailValue}
      options={possibleUsers || []}
      filterOptions={(newOptions) => newOptions}
      classes={{
        root: customClasses?.textField,
        clearIndicator: classes.clearIndicator,
        endAdornment: classes.endAdornment,
        popupIndicator: classes.popupIndicator,
        listbox: classes.autocompleteListbox,
        option: classes.autocompleteOption,
        noOptions: classes.noOptions,
        paper: classes.noOptionPaper,
      }}
      onChange={(_event, option) => {
        if (option) changeEmail(option);
      }}
      onInputChange={(_event, value, reason) => {
        changeEmail({ name: null, email: reason === 'clear' ? '' : value });
      }}
      debug
      getOptionLabel={(option) => option.name || option.email}
      getOptionSelected={(option, value) => option.email === value.email}
      popupIcon={null}
      closeIcon={emailValue !== '' && <CancelIcon fontSize="small" />}
      noOptionsText={
        emailValue.includes('@') && possibleUsers ? (
          <>
            <Button
              variant="contained"
              color="primary"
              className={classes.inviteButton}
              size="large"
              startIcon={<AddRoundedIcon />}
              onClick={inviteButtonOnClick}
            >
              {t('Invite')} {emailValue}
            </Button>
          </>
        ) : (
          <>
            <Typography variant="body1">
              {t('To invite a user for the first time, please enter an email_')}
            </Typography>
          </>
        )
      }
      renderOption={(option) => (
        <>
          <Grid container justify="space-between">
            <Grid item className={classes.option}>
              <Typography variant="subtitle2" className={classes.optionText}>
                {option.name}
              </Typography>
              <Typography variant="body2" className={classes.optionText}>
                {option.email}
              </Typography>
            </Grid>
            <Grid item>
              <AddRoundedIcon color="primary" fontSize="large" />
            </Grid>
          </Grid>
        </>
      )}
      renderInput={(params) =>
        hasNewOption && newOptionValid ? (
          <Card variant="outlined" className={classes.nameCard} onClick={cardOnClick}>
            <Typography variant="body1" className={classes.nameCardLabel}>
              {inputLabel}
              {' *'}
            </Typography>
            <Typography variant="subtitle2" className={classes.optionText}>
              {emailValue}
            </Typography>
            <Typography variant="body2">{t('Pending Invitation')}</Typography>
          </Card>
        ) : (
          <TextField
            {...params}
            required
            label={inputLabel}
            type="text"
            variant="outlined"
            placeholder={placeholder}
            InputLabelProps={{
              ...params.InputLabelProps,
              shrink: true,
            }}
          />
        )
      }
    />
  );
};

export default UserField;
