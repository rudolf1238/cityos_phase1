import { makeStyles } from '@material-ui/core/styles';
import React, { VoidFunctionComponent, memo } from 'react';

import Typography from '@material-ui/core/Typography';

import useCommonTranslation from '../../../hooks/useCommonTranslation';

import BaseDialog from '../../BaseDialog';

const useStyles = makeStyles((theme) => ({
  root: {
    paddingBottom: theme.spacing(4),
    width: 640,
    textAlign: 'center',
  },

  text: {
    margin: theme.spacing(2, 'auto'),
    maxWidth: 378,
  },
}));

interface LineQRCodeDialogProps {
  open: boolean;
  onClose: () => void;
}

const LineQRCodeDialog: VoidFunctionComponent<LineQRCodeDialogProps> = ({
  open,
  onClose,
}: LineQRCodeDialogProps) => {
  const classes = useStyles();
  const { t } = useCommonTranslation('profileMenu');

  return (
    <BaseDialog
      open={open}
      onClose={onClose}
      title=""
      classes={{
        dialog: classes.root,
      }}
      content={
        <>
          <div>
            <img src={process.env.NEXT_PUBLIC_LINE_QR_CODE} alt={t('profileMenu:LINE QR CODE')} />
          </div>
          <div className={classes.text}>
            <a href={process.env.NEXT_PUBLIC_LINE} target="_blank" rel="noreferrer">
              <Typography variant="subtitle1" color="primary" gutterBottom>
                {process.env.NEXT_PUBLIC_LINE}
              </Typography>
            </a>
            <Typography align="left">
              {t(
                'profileMenu:Scan and add CityOS as a friend with this QR code_ Following the instruction in the Line app for binding_',
              )}
            </Typography>
          </div>
        </>
      }
    />
  );
};

export default memo(LineQRCodeDialog);
