import React, { HTMLAttributes, VoidFunctionComponent, useCallback, useMemo } from 'react';

import { fade, makeStyles } from '@material-ui/core';

import { useMap } from 'react-leaflet';

import clsx from 'clsx';

import { useEditorPageContext } from '../EditorPageProvider';
import LayerIcon from '../../assets/icon/layer.svg';
import ZoomFitIcon from '../../assets/icon/zoom-fit.svg';
import ZoomInIcon from '../../assets/icon/zoom-in.svg';
import ZoomOutIcon from '../../assets/icon/zoom-out.svg';

const useStyles = makeStyles((theme) => ({
  root: {
    width: 58,
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
  hr: {
    width: '30px',
    height: '1.5px',
    flexGrow: 0,
    backgroundColor: theme.palette.background.miniTab,
  },
  buttonActive: {
    backgroundColor: fade(theme.palette.action.selected, 0.3),
  },
}));

const EditorMapControl: VoidFunctionComponent<HTMLAttributes<HTMLDivElement>> = () => {
  const classes = useStyles();
  const map = useMap();

  const { isMapEdit, setIsMapEdit, floor } = useEditorPageContext();

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

  const handleLayer = useCallback(() => {
    setIsMapEdit(!isMapEdit);
  }, [isMapEdit, setIsMapEdit]);

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
      <div className={classes.hr} />
      <LayerIcon
        className={clsx(classes.button, { [classes.buttonActive]: isMapEdit })}
        onClick={() => {
          handleLayer();
        }}
      />
    </div>
  );
};

export default EditorMapControl;
