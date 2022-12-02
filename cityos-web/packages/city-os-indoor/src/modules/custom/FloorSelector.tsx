import { makeStyles } from '@material-ui/core/styles';

import React, { FunctionComponent, memo, useCallback, useEffect, useMemo, useState } from 'react';

import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';

import clsx from 'clsx';

import { Floor } from '../../libs/type';

const useStyles = makeStyles((theme) => ({
  floorSelector: {
    position: 'absolute',
    zIndex: 800,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing(1),
    backgroundColor: theme.palette.background.default,
    boxShadow: '0 5px 15px 0 rgba(155, 155, 155, 0.3)',
    borderRadius: theme.spacing(6),
    left: theme.spacing(2),
  },
  floorItem: {
    width: theme.spacing(6),
    height: theme.spacing(6),
    color: theme.palette.info.main,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.palette.background.default,
    fontSize: theme.spacing(2),
    fontWeight: 'bold',
    borderRadius: '100%',
    '&:hover': {
      backgroundColor: theme.palette.action.selected,
      border: `solid 2px ${theme.palette.primary.main}`,
      transition: 'unset',
    },
    cursor: 'pointer',
    transition: 'all .25s',
  },
  floorItemActive: {
    color: '#ffffff',
    backgroundColor: theme.palette.primary.light,
    '&:hover': {
      backgroundColor: theme.palette.primary.light,
    },
    transition: 'all .25s',
  },
  arrowIcon: {
    width: theme.spacing(3),
    height: theme.spacing(3),
    borderRadius: theme.spacing(1),
    color: theme.palette.info.main,
    '&:hover': {
      backgroundColor: theme.palette.action.selected,
      color: theme.palette.primary.main,
      transition: 'unset',
    },
  },
  arrowIconDisabled: {
    color: theme.palette.text.disabled,
    '&:hover': {
      backgroundColor: 'unset',
      color: theme.palette.text.disabled,
      transition: 'unset',
    },
  },
}));

export interface FloorSelectorProps {
  floorList: Floor[];
  selectedFloorNumber: number | null;
  setSelectedFloorNumber: React.Dispatch<React.SetStateAction<number | null>>;
}

const FloorSelector: FunctionComponent<FloorSelectorProps> = (props: FloorSelectorProps) => {
  const { selectedFloorNumber, setSelectedFloorNumber, floorList = [] } = props;
  const classes = useStyles();

  const [page, setPage] = useState(0);
  const itemPrePage = 5;

  const onSelect = useCallback(
    (floorNumber: number) => {
      setSelectedFloorNumber(floorNumber);
    },
    [setSelectedFloorNumber],
  );

  const floorCount = useMemo(() => floorList.length, [floorList]);

  const sortedFloorList = useMemo(
    () => [...floorList].sort((a, b) => b.floorNum - a.floorNum),
    [floorList],
  );

  const pageCount = useMemo(() => Math.ceil(floorCount / itemPrePage), [floorCount]);

  const offsetPage = useCallback(
    (offset: number) => {
      if (page + offset < 0) {
        setPage(0);
      } else if (page + offset > Math.floor(floorCount / itemPrePage)) {
        setPage(Math.floor(floorCount / itemPrePage));
      } else {
        setPage(page + offset);
      }
    },
    [floorCount, page],
  );

  const initial = useCallback(() => {
    const currSelectedFloorNumber = sortedFloorList[floorCount - 1]?.floorNum;
    setSelectedFloorNumber(currSelectedFloorNumber);
  }, [floorCount, setSelectedFloorNumber, sortedFloorList]);

  useEffect(() => {
    setPage(pageCount - 1);
  }, [pageCount]);

  useEffect(() => {
    initial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [floorCount]);

  return (
    <div className={classes.floorSelector}>
      {floorCount > 5 && (
        <KeyboardArrowUpIcon
          className={clsx(classes.arrowIcon, { [classes.arrowIconDisabled]: page === 0 })}
          onClick={() => {
            offsetPage(-1);
          }}
        />
      )}
      {sortedFloorList.map(
        (item: Floor, index: number) =>
          (pageCount - 1 === page
            ? floorCount - itemPrePage <= index
            : itemPrePage * page <= index) &&
          index <= itemPrePage * (page + 1) - 1 && (
            <div
              key={item.floorNum}
              className={clsx(classes.floorItem, {
                [classes.floorItemActive]: item.floorNum === selectedFloorNumber,
              })}
              onClick={() => {
                onSelect(item.floorNum);
              }}
              role="button"
              tabIndex={index}
              onKeyDown={() => {
                onSelect(item.floorNum);
              }}
            >
              {item.floorNum.toString()}
            </div>
          ),
      )}
      {floorCount > 5 && (
        <KeyboardArrowDownIcon
          className={clsx(classes.arrowIcon, {
            [classes.arrowIconDisabled]: page === pageCount - 1,
          })}
          onClick={() => {
            offsetPage(1);
          }}
        />
      )}
    </div>
  );
};

export default memo(FloorSelector);
