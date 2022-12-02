import { LatLng } from 'leaflet';
import { makeStyles } from '@material-ui/core/styles';
import React, { Dispatch, SetStateAction, VoidFunctionComponent, memo, useCallback } from 'react';

import DeleteIcon from '@material-ui/icons/Close';
import DrawingDoneIcon from '@material-ui/icons/RadioButtonUnchecked';
import SelectionDoneIcon from '@material-ui/icons/Done';

import PenIcon from '../../assets/icon/pen.svg';
import ThemeIconButton from '../ThemeIconButton';

const useStyles = makeStyles((theme) => ({
  drawButtons: {
    display: 'flex',
    position: 'absolute',
    right: theme.spacing(4.5),
    bottom: theme.spacing(12),
    flexDirection: 'column',
    gap: theme.spacing(2),
    zIndex: 500, // over leaflet map default zIndex 400
  },

  delete: {
    backgroundColor: '#FFF',

    '&:hover': {
      backgroundColor: '#FFF',
    },
  },
}));

interface DrawControllerProps {
  stage: 'default' | 'drawing' | 'done';
  setStage: Dispatch<SetStateAction<'default' | 'drawing' | 'done'>>;
  setPolygonPositions: Dispatch<SetStateAction<LatLng[]>>;
  onDrawingStart?: () => void;
  onDrawingDone?: () => void;
  onDelete?: () => void;
  onSelectionDone?: () => void;
}

const DrawController: VoidFunctionComponent<DrawControllerProps> = ({
  stage,
  setStage,
  setPolygonPositions,
  onDrawingStart,
  onDrawingDone,
  onDelete,
  onSelectionDone,
}: DrawControllerProps) => {
  const classes = useStyles();

  const handleStart = useCallback(() => {
    setStage('drawing');
    if (onDrawingStart) onDrawingStart();
  }, [setStage, onDrawingStart]);

  const handleDrawingDone = useCallback(() => {
    setStage('done');
    if (onDrawingDone) onDrawingDone();
  }, [onDrawingDone, setStage]);

  const handleDelete = useCallback(() => {
    setStage('default');
    setPolygonPositions([]);
    if (onDelete) onDelete();
  }, [onDelete, setPolygonPositions, setStage]);

  const handleSelectionDone = useCallback(() => {
    setStage('default');
    setPolygonPositions([]);
    if (onSelectionDone) onSelectionDone();
  }, [onSelectionDone, setPolygonPositions, setStage]);

  return (
    <div className={classes.drawButtons}>
      {(stage === 'drawing' || stage === 'done') && (
        <ThemeIconButton color="primary" onClick={handleDelete} className={classes.delete}>
          <DeleteIcon />
        </ThemeIconButton>
      )}
      {stage === 'default' && (
        <ThemeIconButton color="primary" variant="contained" onClick={handleStart}>
          <PenIcon />
        </ThemeIconButton>
      )}
      {stage === 'drawing' && (
        <ThemeIconButton color="primary" variant="contained" onClick={handleDrawingDone}>
          <DrawingDoneIcon />
        </ThemeIconButton>
      )}
      {stage === 'done' && (
        <ThemeIconButton color="primary" variant="contained" onClick={handleSelectionDone}>
          <SelectionDoneIcon />
        </ThemeIconButton>
      )}
    </div>
  );
};

export default memo(DrawController);
