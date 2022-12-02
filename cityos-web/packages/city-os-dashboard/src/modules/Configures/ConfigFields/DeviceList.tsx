import { makeStyles, useTheme } from '@material-ui/core/styles';
import React, { VoidFunctionComponent, memo } from 'react';

import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';

import DeleteIcon from 'city-os-common/assets/icon/delete.svg';
import ThemeIconButton from 'city-os-common/modules/ThemeIconButton';

import { DeviceOption } from '../../../libs/type';
import { defaultColors } from '../../../libs/constants';
import useDashboardTranslation from '../../../hooks/useDashboardTranslation';

const useStyles = makeStyles((theme) => ({
  list: {
    display: 'flex',
    flexDirection: 'column',
    border: `1px solid ${theme.palette.grey[400]}`,
    borderRadius: theme.shape.borderRadius,
    width: '100%',
    height: 360,
    overflow: 'hidden',
  },

  listHeader: {
    flex: 0,
    borderTopLeftRadius: theme.shape.borderRadius,
    borderTopRightRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.background.light,
    padding: theme.spacing(3, 6),

    [theme.breakpoints.down('xs')]: {
      padding: theme.spacing(3, 1.5),
    },
  },

  listWrapper: {
    overflowY: 'auto',
  },

  listItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: theme.spacing(2, 3),
    minHeight: 56,

    [theme.breakpoints.down('xs')]: {
      padding: theme.spacing(3, 1.5),
    },

    '&::after': {
      display: 'none',
    },

    '&:nth-of-type(even)': {
      backgroundColor: theme.palette.background.evenRow,
    },

    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.background.oddRow,
    },
  },

  bullet: {
    flexShrink: 0,
    marginRight: theme.spacing(3),
    width: 8,
    height: 8,
  },
}));

interface DeviceListProps {
  devices: DeviceOption[];
  onDelete: (deviceId: string) => void;
  deviceLimit?: number;
  disableBullet?: boolean;
}

const DeviceList: VoidFunctionComponent<DeviceListProps> = ({
  devices,
  onDelete,
  deviceLimit,
  disableBullet,
}: DeviceListProps) => {
  const classes = useStyles();
  const theme = useTheme();
  const { t } = useDashboardTranslation(['column', 'common']);

  return (
    <div aria-label={t('column:Device Name')} className={classes.list}>
      <Typography
        component="div"
        variant="body1"
        color="textPrimary"
        className={classes.listHeader}
      >
        {deviceLimit
          ? `${t('common:Device')} (${devices.length} OF ${deviceLimit})`
          : t('column:Device Name')}
      </Typography>
      {devices.map(({ label, value: deviceId }, index) => (
        <ListItem key={deviceId} className={classes.listItem}>
          {!disableBullet && (
            <div
              className={classes.bullet}
              style={{ backgroundColor: theme.palette.gadget[defaultColors[index]] }}
            />
          )}
          <ListItemText
            primary={
              <Typography variant="body1" color="textPrimary">
                {label}
              </Typography>
            }
          />
          <ThemeIconButton
            aria-label={t('common:Delete')}
            variant="standard"
            color="primary"
            size="small"
            tooltip={t('common:Delete')}
            onClick={() => onDelete(deviceId)}
          >
            <DeleteIcon />
          </ThemeIconButton>
        </ListItem>
      ))}
    </div>
  );
};

export default memo(DeviceList);
