import React, { HTMLAttributes, VoidFunctionComponent, useCallback, useMemo } from 'react';

import { fade, makeStyles } from '@material-ui/core';

import { useMap } from 'react-leaflet';

import { useViewerPageContext } from '../ViewerPageProvider';
import ZoomFitIcon from '../../assets/icon/zoom-fit.svg';
import ZoomInIcon from '../../assets/icon/zoom-in.svg';
import ZoomOutIcon from '../../assets/icon/zoom-out.svg';

const useStyles = makeStyles((theme) => ({
  root: {
    width: 58,
    height: 162,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    padding: 8,
    borderRadius: 8,
    boxShadow: '0 5px 15px 0 rgba(155, 155, 155, 0.3)',
    backgroundColor: theme.palette.background.default,
  },
  button: {
    borderRadius: theme.spacing(1),
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: theme.palette.type === 'dark' ? fade('#13579F', 0.3) : '#E9F7FF',
    },
    '&:active': {
      backgroundColor: fade(theme.palette.action.selected, 0.3),
    },
  },
}));

const ViewerMapControl: VoidFunctionComponent<HTMLAttributes<HTMLDivElement>> = () => {
  const classes = useStyles();
  const map = useMap();

  const { floor } = useViewerPageContext();

  const imageLeftTop = useMemo<[number, number]>(() => {
    if (floor === null || floor.imageLeftTop === null || floor.imageLeftTop.length < 2) {
      return [1, -1];
    }
    return [Number(floor.imageLeftTop[0]), Number(floor.imageLeftTop[1])];
  }, [floor]);

  const imageRightBottom = useMemo<[number, number]>(() => {
    if (floor === null || floor.imageRightBottom === null || floor.imageRightBottom.length < 2) {
      return [-1, 1];
    }
    return [Number(floor.imageRightBottom[0]), Number(floor.imageRightBottom[1])];
  }, [floor]);

  const handleZoomIn = useCallback(() => {
    map.zoomIn();
  }, [map]);

  const handleZoomOut = useCallback(() => {
    map.zoomOut();
  }, [map]);

  const handleZoomFit = useCallback(() => {
    map.fitBounds([imageLeftTop, imageRightBottom]);
  }, [imageLeftTop, imageRightBottom, map]);

  return (
    <div className={classes.root}>
      <ZoomInIcon
        className={classes.button}
        onClick={() => {
          handleZoomIn();
        }}
      />
      <ZoomOutIcon
        className={classes.button}
        onClick={() => {
          handleZoomOut();
        }}
      />
      <ZoomFitIcon
        className={classes.button}
        onClick={() => {
          handleZoomFit();
        }}
      />
    </div>
  );
};

export default ViewerMapControl;
