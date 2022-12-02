import { makeStyles } from '@material-ui/core/styles';
import React, { ComponentProps, VoidFunctionComponent, useRef, useState } from 'react';
import clsx from 'clsx';

import CancelIcon from '@material-ui/icons/Cancel';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import InputBase from '@material-ui/core/InputBase';
import SearchIcon from '@material-ui/icons/Search';
import TextField from '@material-ui/core/TextField';

import useCommonTranslation from '../hooks/useCommonTranslation';

const useStyles = makeStyles((theme) => ({
  icon: {
    position: 'absolute',
    right: 0,
    color: theme.palette.grey[500],

    '&:hover': {
      borderColor: 'transparent',
      backgroundColor: 'transparent',
    },
  },

  searchIcon: {
    color: theme.palette.grey[500],
  },

  hiddenButton: {
    display: 'none',
  },

  small: {
    width: theme.spacing(38),
  },

  medium: {
    width: theme.spacing(45),
  },

  input: {
    paddingRight: theme.spacing(8),
  },

  adornedEnd: {
    paddingRight: 0,
  },

  adornedRoot: {
    marginLeft: 0,
  },
}));

// call setter directly to trigger event since React(>15.6) overrides input value setter
const setNativeInput = (inputEle: HTMLInputElement, value: string) => {
  const descriptor = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');
  if (descriptor && descriptor.set) {
    const nativeInputValueSetter = descriptor.set.bind(inputEle);
    nativeInputValueSetter(value);
    inputEle.dispatchEvent(new Event('input', { bubbles: true }));
  }
};

type MuiTextFieldProps = ComponentProps<typeof TextField>;
type MuiInputBaseProps = ComponentProps<typeof InputBase>;

interface SearchFieldLiteProps
  extends Omit<MuiTextFieldProps, 'type' | 'inputRef' | 'variant' | 'InputProps' | 'inputProps'> {
  InputProps?: Omit<MuiInputBaseProps, 'endAdornment'>;
  inputProps?: MuiInputBaseProps['inputProps'];
  defaultValue?: string | null;
  onSearch?: (keyword: string | null) => void;
  onClear?: () => void;
}

const SearchFieldLite: VoidFunctionComponent<SearchFieldLiteProps> = ({
  defaultValue,
  onSearch,
  onClear,
  ...props
}: SearchFieldLiteProps) => {
  const { t } = useCommonTranslation('common');
  const classes = useStyles();

  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocus, setIsFocus] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);
  const [keyword, setKeyword] = useState<string | null>(null);

  return (
    <TextField
      {...props}
      label={t('Search')}
      inputRef={inputRef}
      type="search"
      variant="outlined"
      defaultValue={defaultValue}
      onBlur={() => {
        setIsFocus(false);
      }}
      onFocus={() => {
        setIsFocus(true);
      }}
      onChange={(e) => {
        setIsEmpty(e.target.value === '' || e.target.value === undefined);
        setKeyword(e.target.value);
      }}
      className={clsx(props?.size === 'small' ? classes.small : classes.medium, props?.className)}
      InputLabelProps={{ shrink: true, ...props?.InputLabelProps }}
      inputProps={props.inputProps}
      // eslint-disable-next-line react/jsx-no-duplicate-props
      InputProps={{
        ...props.InputProps,
        classes: {
          ...props.InputProps?.classes,
          input: clsx(classes.input, props.InputProps?.classes?.input),
          adornedEnd: clsx(classes.adornedEnd, props.InputProps?.classes?.adornedEnd),
        },
        endAdornment: (
          <InputAdornment position="end" className={classes.adornedRoot}>
            <IconButton
              aria-label={t('Clear')}
              className={clsx(classes.icon, {
                [classes.hiddenButton]: isFocus || isEmpty,
              })}
              onClick={() => {
                if (inputRef.current) {
                  setNativeInput(inputRef.current, '');
                }
                if (onClear) {
                  onClear();
                }
              }}
            >
              <CancelIcon fontSize="small" />
            </IconButton>
            <IconButton
              aria-label={t('Search')}
              className={clsx(classes.icon, classes.searchIcon, {
                [classes.hiddenButton]: !isFocus && !isEmpty,
              })}
              onMouseDown={(e) => {
                e.preventDefault(); // prevent onBlur before onClick
              }}
              onClick={() => {
                inputRef.current?.blur();
                if (onSearch) {
                  onSearch(keyword);
                }
              }}
            >
              <SearchIcon fontSize="small" />
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
  );
};

export default SearchFieldLite;
