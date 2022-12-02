import { makeStyles } from '@material-ui/core/styles';
import { useQuery } from '@apollo/client';
import React, { VoidFunctionComponent, memo, useCallback, useMemo, useRef, useState } from 'react';
import debounce from 'lodash/debounce';

import AddIcon from '@material-ui/icons/Add';
import Autocomplete, { AutocompleteInputChangeReason } from '@material-ui/lab/Autocomplete';
import CancelIcon from '@material-ui/icons/Cancel';
import CircularProgress from '@material-ui/core/CircularProgress';
import SearchIcon from '@material-ui/icons/Search';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';

import {
  POSSIBLE_USERS,
  PossibleUser,
  PossibleUsersPayload,
  PossibleUsersResponse,
} from 'city-os-common/api/possibleUsers';
import { User } from 'city-os-common/libs/schema';
import { useStore } from 'city-os-common/reducers';

import ThemeIconButton from 'city-os-common/modules/ThemeIconButton';

import useAutomationTranslation from '../../../../hooks/useAutomationTranslation';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    gap: theme.spacing(1.5),
  },

  textField: {
    width: 320,
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

  loading: {
    textAlign: 'center',
  },

  option: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0.25),
    justifyContent: 'center',
    paddingLeft: theme.spacing(3),
  },

  optionText: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },

  inputLabel: {
    textTransform: 'capitalize',
  },
}));

interface SearchUserFieldProps {
  onAdd: (user: Pick<User, 'email' | 'name'>) => void;
}

const SearchUserField: VoidFunctionComponent<SearchUserFieldProps> = ({
  onAdd,
}: SearchUserFieldProps) => {
  const { t } = useAutomationTranslation(['common', 'automation']);
  const classes = useStyles();
  const {
    userProfile: { divisionGroup },
  } = useStore();
  const [emailValue, setEmailValue] = useState('');
  const [emailName, setEmailName] = useState<string | null>(null);
  const [possibleUsers, setPossibleUsers] = useState<PossibleUser[]>([]);
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useQuery<PossibleUsersResponse, PossibleUsersPayload>(POSSIBLE_USERS, {
    skip: !divisionGroup?.id,
    variables: {
      keyword,
      size: 5,
      groupId: divisionGroup?.id,
    },
    onCompleted: (data) => {
      setPossibleUsers(data.possibleUsers?.map(({ email, name }) => ({ email, name })) || []);
      setLoading(false);
    },
    onError: () => {
      setLoading(false);
    },
  });

  const debounceUpdateKeyword = useMemo(
    () =>
      debounce((newKeyword: string) => {
        setKeyword(newKeyword);
      }, 500),
    [],
  );

  const changeSearchValue = useCallback(
    ({ name, email }: { name: null | string; email: string }) => {
      setPossibleUsers([]);
      setEmailValue(email);
      setEmailName(name);
      setLoading(true);
      debounceUpdateKeyword(email);
    },
    [debounceUpdateKeyword],
  );

  const onSelectedOptionChange = useCallback(
    (_event, option: PossibleUser | null) => {
      if (option) changeSearchValue({ name: option.name || '', email: option.email });
      if (inputRef.current) inputRef.current.blur();
    },
    [changeSearchValue],
  );

  const onInputChange = useCallback(
    (_event, value: string, reason: AutocompleteInputChangeReason) => {
      if (reason === 'reset') return;
      changeSearchValue({ name: null, email: reason === 'clear' ? '' : value });
    },
    [changeSearchValue],
  );

  const onAddClick = useCallback(() => {
    onAdd({ email: emailValue, name: emailName || '' });
    changeSearchValue({ name: null, email: '' });
  }, [emailValue, emailName, onAdd, changeSearchValue]);

  return (
    <div className={classes.root}>
      <Autocomplete
        inputValue={emailName || emailValue}
        options={possibleUsers}
        filterOptions={(newOptions) => newOptions}
        classes={{
          root: classes.textField,
          clearIndicator: classes.clearIndicator,
          endAdornment: classes.endAdornment,
          popupIndicator: classes.popupIndicator,
          listbox: classes.autocompleteListbox,
          option: classes.autocompleteOption,
          noOptions: classes.noOptions,
          paper: classes.noOptionPaper,
          loading: classes.loading,
        }}
        debug
        popupIcon={null}
        onChange={onSelectedOptionChange}
        onInputChange={onInputChange}
        getOptionLabel={(option) => option.name || option.email}
        getOptionSelected={(option) => option.email === emailValue}
        noOptionsText={t('automation:No results for "{{keyword}}"', {
          keyword: emailValue,
        })}
        closeIcon={
          emailName === null ? <SearchIcon fontSize="small" /> : <CancelIcon fontSize="small" />
        }
        loading={loading}
        loadingText={<CircularProgress />}
        renderOption={(option) => (
          <div className={classes.option}>
            <Typography variant="body1" className={classes.optionText}>
              {option.name}
            </Typography>
            <Typography variant="caption" className={classes.optionText}>
              {option.email}
            </Typography>
          </div>
        )}
        renderInput={(params) => (
          <TextField
            {...params}
            label={t('common:Search user')}
            type="text"
            variant="outlined"
            placeholder={t('common:Insert user name or email')}
            InputLabelProps={{
              ...params.InputLabelProps,
              shrink: true,
              className: classes.inputLabel,
            }}
            inputRef={inputRef}
          />
        )}
      />
      <ThemeIconButton
        variant="contained"
        tooltip={t('common:Add')}
        disabled={emailName === null}
        onClick={onAddClick}
      >
        <AddIcon />
      </ThemeIconButton>
    </div>
  );
};

export default memo(SearchUserField);
