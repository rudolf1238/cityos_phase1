import { makeStyles } from '@material-ui/core/styles';
import { useRouter } from 'next/router';
import React, { VoidFunctionComponent, useEffect, useMemo } from 'react';

import { VerifyType } from 'city-os-common/libs/schema';
import { isNumberString, isString, isVerifyType } from 'city-os-common/libs/validators';

import BackgroundImage from 'city-os-common/modules/BackgroundImage';
import PageWithFooter from 'city-os-common/modules/PageWithFooter';

import { changeLanguage, parseI18nLanguage } from '../libs/i18n';

import DeviceVerify from '../modules/Verify/DeviceVerify';
import InvalidAccessCode from '../modules/Verify/InvalidAccessCode';
import Register from '../modules/Verify/Register';
import ResetPassword from '../modules/Verify/ResetPassword';
import cityBackground from '../assets/img/city-background.png';

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: 'calc(var(--vh) * 100)',
  },

  content: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  footer: {
    '& > p': {
      color: theme.palette.primary.contrastText,
    },
  },
}));

const Verify: VoidFunctionComponent = () => {
  const classes = useStyles();
  const router = useRouter();

  const typeInUrl =
    typeof router.query.type === 'string' ? router.query.type.toUpperCase() : undefined;
  const type = isVerifyType(typeInUrl) ? typeInUrl : undefined;
  const expired = isNumberString(router.query.expired) ? +router.query.expired : 0;
  const email = isString(router.query.email) ? decodeURI(router.query.email) : '';
  const accessCode = isString(router.query.accessCode) ? router.query.accessCode : '';

  const isValid = useMemo(() => expired * 1000 > Date.now(), [expired]);

  const content = useMemo(() => {
    if (type === VerifyType.BINDING) {
      return <DeviceVerify accessCode={accessCode} />;
    }
    if (!isValid) {
      return <InvalidAccessCode type={type} />;
    }
    if (type === VerifyType.RESET) {
      return <ResetPassword accessCode={accessCode} />;
    }
    if (type === VerifyType.REGISTER) {
      return <Register email={email} accessCode={accessCode} />;
    }
    return null;
  }, [accessCode, email, isValid, type]);

  useEffect(() => {
    const langString = isString(router.query.lang) ? router.query.lang : '';
    const lang = parseI18nLanguage(langString);
    void changeLanguage(lang);
  }, [router.query.lang]);

  return (
    <BackgroundImage imageData={cityBackground} objectFit="cover">
      <PageWithFooter
        classes={{ root: classes.root, content: classes.content, footer: classes.footer }}
      >
        {content}
      </PageWithFooter>
    </BackgroundImage>
  );
};

export default Verify;
