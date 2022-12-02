import { makeStyles } from '@material-ui/core/styles';

import React, { VoidFunctionComponent, useMemo } from 'react';
import dynamic from 'next/dynamic';

import { useViewerPageContext } from '../ViewerPageProvider';
import DeviceDetailDrawer from '../custom/DeviceDetailDrawer';
import DeviceList from '../custom/DeviceList';

const useStyles = makeStyles((_theme) => ({
  subContainer: {
    display: 'flex',
    flex: 1,
    height: '100%',
    overflowY: 'auto',
    '&>div::selection': {
      background: '#00000000',
    },
    flexDirection: 'column',
  },

  sideBar: {
    display: 'flex',
  },

  bottomDrawer: {
    display: 'flex',
  },
}));

const DeviceMapMode: VoidFunctionComponent = () => {
  const classes = useStyles();

  const { activeId } = useViewerPageContext();

  const DeviceMap = useMemo(
    () =>
      dynamic(() => import('../map/DeviceMap'), {
        ssr: false,
      }),
    [],
  );

  return (
    <>
      <div className={classes.subContainer}>
        <DeviceMap />
        {DeviceMap && (
          <div className={classes.bottomDrawer}>
            <DeviceDetailDrawer open={!!activeId} />
          </div>
        )}
      </div>
      <div className={classes.sideBar}>
        <DeviceList open onToggle={(_isOpen: boolean) => {}} mode="map" />
      </div>
    </>
  );
};

export default DeviceMapMode;
