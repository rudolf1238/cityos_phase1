import { makeStyles } from '@material-ui/core/styles';
import React, { VoidFunctionComponent, memo } from 'react';
import clsx from 'clsx';

import DoneAllIcon from '@material-ui/icons/DoneAll';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';

import { DeviceType } from 'city-os-common/libs/schema';

import DeviceIcon from 'city-os-common/modules/DeviceIcon';
import ExtendablePanel from 'city-os-common/modules/ExtendablePanel';

/** css animation constants */
const twinkleDuration = 1_000;
const twinkleDelay = 0;
const twinkleTimes = 2;
const fadeOutDelay = twinkleDuration * twinkleTimes;
const fadeOutDuration = 10_000;

const useStyles = makeStyles((theme) => ({
  selectedMenu: {
    zIndex: theme.zIndex.speedDial,
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[10],
  },

  selectedMenuTablet: {
    [theme.breakpoints.down('sm')]: {
      position: 'absolute',
      right: 0,
      height: '100%',
    },
  },

  paper: {
    display: 'flex',
    flexDirection: 'column',
  },

  extendablePanel: {
    height: '100%',
  },

  toggle: {
    top: theme.spacing(14),
  },

  counter: {
    display: 'flex',
    justifyContent: 'flex-end',
    width: '100%',
    padding: theme.spacing(2.5),
    backgroundColor: theme.palette.background.oddRow,
    borderTop: `1px solid ${theme.palette.background.miniTab}`,
    borderBottom: `1px solid ${theme.palette.background.miniTab}`,
  },

  list: {
    paddingTop: 0,
    paddingBottom: 0,
    overflowY: 'auto',
  },

  listItem: {
    gap: theme.spacing(1),
    height: theme.spacing(7),
    paddingLeft: theme.spacing(4),
    cursor: 'pointer',

    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.background.evenRow,
    },

    '&:nth-of-type(even)': {
      backgroundColor: theme.palette.background.oddRow,
    },

    '&:hover': {
      backgroundColor: theme.palette.action.selected,
    },

    '&::after': {
      display: 'none',
    },
  },

  activeItem: {
    '&$selected': {
      animation: `$fadeOut ${fadeOutDuration}ms ${theme.transitions.easing.easeInOut}`,
    },
  },

  selectedItem: {
    '&$selected': {
      animation: `$twinkle ${twinkleDuration}ms ${twinkleDelay}ms ${twinkleTimes} ${theme.transitions.easing.sharp}, $fadeOut ${fadeOutDuration}ms ${fadeOutDelay}ms ${theme.transitions.easing.easeInOut}`,
    },
  },

  '@keyframes fadeOut': {
    from: {
      backgroundColor: theme.palette.action.selected,
    },

    to: {
      backgroundColor: 'transparent',
    },
  },

  '@keyframes twinkle': {
    '50%': {
      backgroundColor: theme.palette.action.selected,
    },

    '100%': {
      backgroundColor: 'transparent',
    },
  },

  selected: {
    borderTop: `1px solid ${theme.palette.background.default}`,
    borderBottom: `1px solid ${theme.palette.background.default}`,

    '&:last-child': {
      borderBottom: '1px solid transparent',
    },
  },

  listItemIcon: {
    minWidth: theme.spacing(3),
    color: theme.palette.info.contrastText,
  },

  avatar: {
    width: theme.spacing(3),
    height: theme.spacing(3),
    backgroundColor: theme.palette.primary.main,
  },

  cameraIcon: {
    padding: theme.spacing(0.5),
    backgroundColor: theme.palette.secondary.main,
    borderRadius: '50%',
  },

  listItemIconSmall: {
    position: 'absolute',
    left: 6,
  },

  pushPinIcon: {
    color: 'rgba(0, 0, 0, 0.12)',
    height: 13,
  },
}));

interface CameraListProps {
  open: boolean;
  mode: 'map' | 'splitScreen';
  onToggle: (isOpen: boolean) => void;
}

const CameraList: VoidFunctionComponent<CameraListProps> = ({
  open,
  mode,
  onToggle,
}: CameraListProps) => {
  const classes = useStyles();

  return (
    <div
      className={clsx(classes.selectedMenu, {
        [classes.selectedMenuTablet]: mode === 'splitScreen',
      })}
    >
      <ExtendablePanel
        size={330}
        open={open}
        onToggle={onToggle}
        direction="right"
        PaperProps={{
          className: classes.paper,
        }}
        classes={{ root: classes.extendablePanel, toggle: classes.toggle }}
      >
        <div className={classes.counter}>
          <Typography variant="body2">1 device</Typography>
        </div>
        <List aria-label="Camera List" className={classes.list}>
          <ListItem
            classes={{
              root: clsx(classes.listItem),
              selected: classes.selected,
            }}
            onClick={() => {}}
            onAnimationEnd={() => {}}
          >
            <ListItemIcon className={classes.listItemIconSmall}>
              <DoneAllIcon className={classes.pushPinIcon} fontSize="small" />
            </ListItemIcon>
            <ListItemIcon className={classes.listItemIcon}>
              <DeviceIcon type={DeviceType.CAMERA} className={classes.cameraIcon} />
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography variant="body2" color="textPrimary">
                  camera name
                </Typography>
              }
            />
          </ListItem>
        </List>
      </ExtendablePanel>
    </div>
  );
};

export default memo(CameraList);
