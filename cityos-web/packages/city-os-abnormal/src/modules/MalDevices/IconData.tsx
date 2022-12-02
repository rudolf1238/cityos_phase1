import { DeviceType } from 'city-os-common/libs/schema';
import { makeStyles } from '@material-ui/core/styles';
import React, { FunctionComponent } from 'react';
import ThemeIconButton from 'city-os-common/modules/ThemeIconButton';

import { useTranslation } from 'react-i18next';

import DeviceIcon from '../common/DeviceIcon';
import NotifyIcon from '../common/NotifyIcon';

import { NotifyType } from '../../libs/schema';

const useStyles = makeStyles((theme) => ({
  type: {
    display: 'flex',
    gap: theme.spacing(1.5),
    alignItems: 'center',
  },
}));

interface InfoProps {
  devicetypeData?: DeviceType;
  notitypeData?: NotifyType;
  typeindex: number;
  onselect: boolean[];
  clickChange: (
    devicetypeData: DeviceType | undefined,
    notifytypeData: NotifyType | undefined,
  ) => void | undefined;
}

const IconData: FunctionComponent<InfoProps> = ({
  devicetypeData,
  notitypeData,
  typeindex,
  onselect,
  clickChange,
}: InfoProps) => {
  const classes = useStyles();
  const { t } = useTranslation(['common', 'division', 'info']);

  return (
    <div className={classes.type}>
      <ThemeIconButton
        color="primary"
        variant={onselect[typeindex] ? 'contained' : 'outlined'}
        tooltip={
          (devicetypeData !== undefined ? t(`info:${devicetypeData}`) : undefined) ||
          (notitypeData !== undefined ? t(`info:${notitypeData}`) : undefined)
        }
        onClick={() => {
          if (devicetypeData) clickChange(devicetypeData, undefined);
          if (notitypeData) clickChange(undefined, notitypeData);
        }}
      >
        {devicetypeData && <DeviceIcon type={devicetypeData} />}
        {notitypeData && <NotifyIcon type={notitypeData} />}
      </ThemeIconButton>
    </div>
  );
};

export default IconData;
