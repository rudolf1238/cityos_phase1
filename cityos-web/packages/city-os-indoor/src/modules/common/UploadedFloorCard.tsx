import { makeStyles } from '@material-ui/core/styles';

import React, { VoidFunctionComponent, memo, useRef } from 'react';

import TextField from '@material-ui/core/TextField';

import { DebouncedFunc } from 'lodash';
import { useDrag, useDrop } from 'react-dnd';
import type { Identifier, XYCoord } from 'dnd-core';

import Img from 'city-os-common/src/modules/Img';

import ControlMenuIcon from '../../assets/icon/control-menu.svg';

import { Floor } from '../../libs/type';

const useStyles = makeStyles((theme) => ({
  uploadedCard: {
    display: 'flex',
    flexDirection: 'row',
    width: theme.spacing(55),
    height: theme.spacing(12),
    borderRadius: theme.spacing(1),
    border:
      theme.palette.type === 'dark'
        ? 'solid 1px rgba(255, 255, 255, 0.12)'
        : 'solid 1px rgba(0, 0, 0, 0.12)',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing(1.25, 2, 1.875, 1),
    flexShrink: 0,
    backgroundColor: theme.palette.background.oddRow,
    '&:hover': {
      backgroundColor: theme.palette.background.evenRow,
    },
    gap: theme.spacing(2),
  },

  uploadedCardImage: {
    width: theme.spacing(9),
    height: theme.spacing(9),
    borderRadius: theme.spacing(1),
    boxShadow: `${theme.spacing(0, 0.125, 0.5, 0)} rgba(184, 197, 211, 0.25)`,
    backgroundSize: 'cover',
  },

  uploadedCardFloorNumberInput: {
    width: theme.spacing(7),
  },

  uploadedCardFloorNameInput: {
    flexGrow: 1,
  },
}));

export interface UploadedFloorCardProps {
  floor: Floor;
  index: number;
  debounceSetFloorNum: DebouncedFunc<(index: number, floorNum: number) => void>;
  debounceSetFloorName: DebouncedFunc<(index: number, floorName: string) => void>;
  moveCard: (dragIndex: number, hoverIndex: number) => void;
}

interface DragItem {
  index: number;
  id: string;
  type: string;
}

const UploadedFloorCard: VoidFunctionComponent<UploadedFloorCardProps> = (
  props: UploadedFloorCardProps,
) => {
  const classes = useStyles();
  const { floor, index, debounceSetFloorNum, debounceSetFloorName, moveCard } = props;
  const { id } = floor;

  const dragRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [{ handlerId }, drop] = useDrop<DragItem, void, { handlerId: Identifier | null }>({
    accept: 'uploaded-floor-card',
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: DragItem, monitor) {
      if (!cardRef.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }

      const hoverBoundingRect = cardRef.current?.getBoundingClientRect();

      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      moveCard(dragIndex, hoverIndex);

      // eslint-disable-next-line no-param-reassign
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag, preview] = useDrag({
    type: 'uploaded-floor-card',
    item: () => ({ id, index }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const opacity = isDragging ? 0 : 1;
  drag(dragRef);
  preview(drop(cardRef));

  // TODO: 待後端改好 tag 可以是文字之後，這邊就不需要繼續限制數字型別
  return (
    <div
      className={classes.uploadedCard}
      style={{ opacity }}
      ref={cardRef}
      data-handler-id={handlerId}
    >
      <div
        ref={dragRef}
        style={{
          height: '100%',
          cursor: 'move',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ControlMenuIcon />
      </div>
      <Img id={floor.id} className={classes.uploadedCardImage} />
      <TextField
        className={classes.uploadedCardFloorNumberInput}
        variant="outlined"
        inputProps={{
          inputMode: 'numeric',
          pattern: '[0-9]*',
          style: { textAlign: 'center' },
        }}
        defaultValue={floor.floorNum}
        onChange={(e) => {
          debounceSetFloorNum(index, Number(e.target.value || '0') || 0);
        }}
      />
      <TextField
        className={classes.uploadedCardFloorNameInput}
        variant="outlined"
        defaultValue={floor.name}
        onChange={(e) => {
          debounceSetFloorName(index, e.target.value);
        }}
      />
    </div>
  );
};
export default memo(UploadedFloorCard);
