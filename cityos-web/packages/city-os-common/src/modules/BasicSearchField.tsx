import { UseFormRegisterReturn, useForm } from 'react-hook-form';
import { makeStyles } from '@material-ui/core/styles';
import React, {
  ComponentProps,
  FunctionComponent,
  PropsWithChildren,
  ReactElement,
  useCallback,
  useRef,
  useState,
} from 'react';
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

interface FormWrapperProps {
  disableForm?: boolean;
  children: ReactElement;
  onSubmit: () => void;
}

const FormWrapper: FunctionComponent<FormWrapperProps> = ({
  disableForm,
  children,
  onSubmit,
}: PropsWithChildren<FormWrapperProps>) =>
  disableForm ? (
    children
  ) : (
    <form onSubmit={onSubmit} action="">
      {children}
    </form>
  );

type MuiTextFieldProps = ComponentProps<typeof TextField>;
type MuiInputBaseProps = ComponentProps<typeof InputBase>;

interface FormData {
  keyword: string;
}

interface BasicSearchFieldProps<DisableForm extends boolean = boolean>
  extends Omit<MuiTextFieldProps, 'type' | 'inputRef' | 'variant' | 'InputProps' | 'inputProps'> {
  InputProps?: Omit<MuiInputBaseProps, 'endAdornment'>;
  inputProps?: DisableForm extends true
    ? MuiInputBaseProps['inputProps']
    : Omit<MuiInputBaseProps['inputProps'], keyof UseFormRegisterReturn>;
  disableForm?: DisableForm;
  onSearch?: (keyword: string | null) => void;
  onClear?: () => void;
}

const BasicSearchField = <DisableForm extends boolean = boolean>({
  disableForm,
  onSearch,
  onClear,
  ...props
}: PropsWithChildren<BasicSearchFieldProps<DisableForm>>): ReactElement | null => {
  const { t } = useCommonTranslation('common');
  const classes = useStyles();
  const { handleSubmit, register } = useForm<FormData>({
    defaultValues: { keyword: '' },
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocus, setIsFocus] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);
  const [keyword, setKeyword] = useState<string | null>(null);

  const onSubmit = useCallback(
    (data: FormData) => {
      if (onSearch) {
        onSearch(data.keyword.trim());
      }
    },
    [onSearch],
  );

  return (
    <FormWrapper disableForm={disableForm} onSubmit={handleSubmit(onSubmit)}>
      <TextField
        {...props}
        inputRef={inputRef}
        type="search"
        variant="outlined"
        onBlur={(e) => {
          setIsFocus(false);
          if (props.onBlur) {
            props.onBlur(e);
          }
        }}
        onFocus={(e) => {
          setIsFocus(true);
          if (props.onFocus) {
            props.onFocus(e);
          }
        }}
        onChange={(e) => {
          setIsEmpty(e.target.value === '' || e.target.value === undefined);
          setKeyword(e.target.value);
          if (props.onChange) {
            props.onChange(e);
          }
        }}
        className={clsx(props?.size === 'small' ? classes.small : classes.medium, props?.className)}
        InputLabelProps={{ shrink: true, ...props?.InputLabelProps }}
        inputProps={{ ...props.inputProps, ...(!disableForm && register('keyword')) }}
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
                type="submit"
                className={clsx(classes.icon, classes.searchIcon, {
                  [classes.hiddenButton]: !isFocus && !isEmpty,
                })}
                onMouseDown={(e) => {
                  e.preventDefault(); // prevent onBlur before onClick
                }}
                onClick={() => {
                  inputRef.current?.blur();
                  if (disableForm && onSearch) {
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
    </FormWrapper>
  );
};

export default BasicSearchField;
