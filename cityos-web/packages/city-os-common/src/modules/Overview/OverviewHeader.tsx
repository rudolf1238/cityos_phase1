import { makeStyles } from '@material-ui/core/styles';
import React, { VoidFunctionComponent } from 'react';

import Avatar from '@material-ui/core/Avatar';

import { PartialDevice } from './type';
import useCommonTranslation from '../../hooks/useCommonTranslation';
import useHiddenStyles from '../../styles/hidden';

import { OverviewCell, OverviewRow } from './Overview';
import DeviceIcon from '../DeviceIcon';

const useStyles = makeStyles((theme) => ({
  icon: {
    margin: 'auto',
    backgroundColor: theme.palette.background.icon,
    width: theme.spacing(6.5),
    height: theme.spacing(6.5),
  },

  header: {
    backgroundColor: theme.palette.background.light,
  },

  items: {
    [theme.breakpoints.down('md')]: {
      height: theme.spacing(12),
    },
  },
}));

interface OverviewHeaderProps {
  device: Omit<PartialDevice, 'sensors' | 'status'>;
  shrink?: boolean;
}

const OverviewHeader: VoidFunctionComponent<OverviewHeaderProps> = ({
  device,
  shrink,
}: OverviewHeaderProps) => {
  const classes = useStyles();
  const { t } = useCommonTranslation(['common', 'column']);
  const hiddenClasses = useHiddenStyles();

  return (
    <OverviewRow type="header" alignItems="center" className={classes.header}>
      <OverviewCell lg={2} md={shrink ? 4 : 2} sm={shrink ? 4 : 2} xs={4} className={classes.items}>
        <Avatar className={classes.icon}>
          <DeviceIcon type={device.type} />
        </Avatar>
      </OverviewCell>
      <OverviewCell
        lg={3}
        md={shrink ? 8 : 5}
        sm={shrink ? 8 : 5}
        xs={8}
        className={classes.items}
        label={t('column:Device ID')}
        value={device.deviceId}
      />
      <OverviewCell
        xs={4}
        className={shrink ? hiddenClasses.lgUpHidden : hiddenClasses.smUpHidden}
      />
      <OverviewCell
        lg={3}
        md={shrink ? 8 : 5}
        sm={shrink ? 8 : 5}
        xs={8}
        className={classes.items}
        label={t('column:Device Name')}
        value={device.name}
      />
      <OverviewCell
        md={shrink ? 4 : 2}
        sm={shrink ? 4 : 2}
        xs={4}
        className={hiddenClasses.lgUpHidden}
      />
      <OverviewCell
        lg={4}
        md={shrink ? 8 : 5}
        sm={shrink ? 8 : 5}
        xs={8}
        className={classes.items}
        label={t('common:Divisions')}
        value={device.groups.map((group) => group.name).join(', ')}
      />
      <OverviewCell xs={4} className={hiddenClasses.xsUpHidden} />
    </OverviewRow>
  );
};

export default OverviewHeader;
