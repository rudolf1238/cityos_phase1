import { makeStyles } from '@material-ui/core/styles';
import PhoneNumber from 'awesome-phonenumber';
import React, {
  ChangeEvent,
  VoidFunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import countries from '@ntpu/i18n-iso-countries';

import InputAdornment from '@material-ui/core/InputAdornment';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';

import useCommonTranslation from '../hooks/useCommonTranslation';

import FlagIcon from './FlagIcon';

const useStyles = makeStyles((theme) => ({
  adornedStart: {
    paddingLeft: 0,

    '& .MuiOutlinedInput-root > .MuiOutlinedInput-notchedOutline': {
      borderColor: 'transparent',
    },
  },

  countryCode: {
    paddingRight: theme.spacing(1),
  },

  notchedOutline: {
    borderColor: 'transparent !important',
  },

  selectMenu: {
    textOverflow: 'clip',

    '& > span:nth-of-type(2)': {
      display: 'none',
    },
  },

  select: {
    '&:focus': {
      backgroundColor: 'transparent',
    },
  },

  menuPaper: {
    marginTop: theme.spacing(1),
  },

  menuList: {
    padding: 0,
    height: 160,
  },

  countryLabel: {
    marginLeft: theme.spacing(1),
    color: theme.palette.text.primary,
  },
}));

interface PhoneFieldProps {
  value?: string;
  className?: string;
  onChange: (value: string, isValid: boolean) => void;
}

const PhoneField: VoidFunctionComponent<PhoneFieldProps> = ({
  value: initialValue,
  className,
  onChange,
}: PhoneFieldProps) => {
  const classes = useStyles();
  const { t } = useCommonTranslation('common');
  const [countryCode, setCountryCode] = useState(process.env.NEXT_PUBLIC_COUNTRY_CODE || '');
  const [phone, setPhone] = useState<string>('');
  const [isValid, setIsValid] = useState<boolean | undefined>(undefined);
  const [isDirty, setIsDirty] = useState(false);

  const onSelectCountryCode = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
      setCountryCode(e.target.value);
      setIsDirty(true);
    },
    [],
  );

  const onChangePhone = useCallback((e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    setPhone(e.target.value);
    setIsDirty(true);
  }, []);

  const regionCode = useMemo(() => PhoneNumber.getCountryCodeForRegionCode(countryCode), [
    countryCode,
  ]);

  useEffect(() => {
    const pn = new PhoneNumber(phone, countryCode);
    const result = pn.isValid();
    setIsValid(result);
    onChange(pn.getNumber(), result);
  }, [countryCode, phone, onChange]);

  useEffect(() => {
    if (initialValue) {
      const pn = new PhoneNumber(initialValue);
      setCountryCode(pn.getRegionCode());
      setPhone(pn.getNumber('significant'));
    }
  }, [initialValue]);

  return (
    <TextField
      type="tel"
      variant="outlined"
      label={t('Phone')}
      placeholder={t('Insert your phone number')}
      error={isValid === false && isDirty}
      helperText={isValid === false && isDirty && t('Invalid number_ Try again_')}
      fullWidth
      value={phone}
      className={className}
      onChange={onChangePhone}
      InputProps={{
        classes: {
          adornedStart: classes.adornedStart,
        },
        startAdornment: (
          <InputAdornment position="start">
            <>
              <TextField
                variant="outlined"
                type="text"
                select
                value={countryCode}
                onChange={onSelectCountryCode}
                InputProps={{
                  classes: {
                    root: classes.countryCode,
                    notchedOutline: classes.notchedOutline,
                  },
                }}
                SelectProps={{
                  classes: {
                    selectMenu: classes.selectMenu,
                    select: classes.select,
                  },
                  MenuProps: {
                    getContentAnchorEl: null,
                    anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
                    transformOrigin: { vertical: 'top', horizontal: 'left' },
                    classes: {
                      paper: classes.menuPaper,
                      list: classes.menuList,
                    },
                  },
                }}
              >
                {Object.keys(countries.getAlpha2Codes()).map((country) => (
                  <MenuItem key={country} value={country}>
                    <>
                      <FlagIcon code={country.toLowerCase()} />
                      <span className={classes.countryLabel}>{`${countries.getName(
                        country,
                        countries.langs()[0],
                      )} (+${PhoneNumber.getCountryCodeForRegionCode(country)})`}</span>
                    </>
                  </MenuItem>
                ))}
              </TextField>
              {countryCode ? `+${regionCode}` : ''}
            </>
          </InputAdornment>
        ),
      }}
    />
  );
};

export default PhoneField;
