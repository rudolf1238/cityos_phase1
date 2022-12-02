import { Trans } from 'react-i18next';
import { makeStyles } from '@material-ui/core/styles';
import { useRouter } from 'next/router';
import React, { ReactNode, VoidFunctionComponent, useCallback, useMemo } from 'react';

import Typography from '@material-ui/core/Typography';

import { VerifyType } from 'city-os-common/libs/schema';

import Link from 'city-os-common/modules/Link';
import PaperWrapper from 'city-os-common/modules/PaperWrapper';

import useWebTranslation from '../../hooks/useWebTranslation';

const useStyles = makeStyles((theme) => ({
  link: {
    color: theme.palette.primary.main,
  },

  button: {
    padding: theme.spacing(2),
  },
}));

interface InvalidMessageProps {
  type: VerifyType | undefined;
}

const InvalidAccessCode: VoidFunctionComponent<InvalidMessageProps> = ({
  type,
}: InvalidMessageProps) => {
  const classes = useStyles();
  const { t } = useWebTranslation('verify');
  const router = useRouter();

  const handleBackLogin = useCallback(() => {
    void router.push('/login');
  }, [router]);

  const title = useMemo<string>(() => {
    switch (type) {
      case VerifyType.RESET:
        return t('Invalid Reset Link');
      case VerifyType.REGISTER:
        return t('Invalid Link');
      default:
        return '';
    }
  }, [t, type]);

  const content = useMemo<ReactNode>(() => {
    switch (type) {
      case VerifyType.RESET:
        return (
          <Trans
            t={t}
            i18nKey="Sorry, this password reset link is no longer valid_ Please try <1>resetting your password</1> again_"
          >
            {/* eslint-disable-next-line react/jsx-curly-brace-presence */}
            {"Sorry, this reset password link doesn't look valid anymore. You can try"}
            <Link href="/forgot-password" className={classes.link}>
              resetting your password
            </Link>
            {' again.'}
          </Trans>
        );
      case VerifyType.REGISTER:
        return t('The invitation cannot be found with the provided invite token_');
      default:
        return null;
    }
  }, [t, type, classes.link]);

  return (
    <PaperWrapper title={title} actionText={t('Back to the Homepage')} onAction={handleBackLogin}>
      <Typography variant="body1">{content}</Typography>
    </PaperWrapper>
  );
};

export default InvalidAccessCode;
