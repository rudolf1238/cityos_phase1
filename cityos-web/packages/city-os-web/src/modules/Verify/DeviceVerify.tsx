import { makeStyles } from '@material-ui/core/styles';
import { useMutation } from '@apollo/client';
import React, { VoidFunctionComponent, useEffect } from 'react';

import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

import PaperWrapper from 'city-os-common/modules/PaperWrapper';

import VerificationSuccessfulImg from '../../assets/img/verification-successful.svg';

import {
  VERIFY_ACCESS_CODE,
  VerifyAccessCodePayload,
  VerifyAccessCodeResponse,
} from '../../api/verifyAccessCode';
import useWebTranslation from '../../hooks/useWebTranslation';

const useStyles = makeStyles((theme) => ({
  content: {
    overflow: 'hidden',
    textAlign: 'center',

    '& > * + *': {
      marginTop: theme.spacing(1),
    },
  },

  background: {
    margin: theme.spacing(-4.5, -12, 0),
    backgroundColor: theme.palette.background.oddRow,
    padding: theme.spacing(6.5, 0, 4),
  },
}));

interface DeviceVerifyProps {
  accessCode: string;
}

const DeviceVerify: VoidFunctionComponent<DeviceVerifyProps> = ({
  accessCode,
}: DeviceVerifyProps) => {
  const classes = useStyles();
  const { t } = useWebTranslation(['login', 'common']);
  const [verifyAccessCode] = useMutation<VerifyAccessCodeResponse, VerifyAccessCodePayload>(
    VERIFY_ACCESS_CODE,
  );

  useEffect(() => {
    void verifyAccessCode({
      variables: {
        accessCode,
      },
    });
  }, [accessCode, verifyAccessCode]);

  return (
    <PaperWrapper
      classes={{
        paper: classes.content,
      }}
    >
      <div className={classes.background}>
        <VerificationSuccessfulImg />
      </div>
      <Typography variant="h6">{t('login:Verification Successful_')}</Typography>
      <Button variant="text" color="primary" href="/">
        {t('common:Return to the Homepage')}
      </Button>
    </PaperWrapper>
  );
};

export default DeviceVerify;
