import { makeStyles } from '@material-ui/core/styles';
import React, { VoidFunctionComponent, useMemo } from 'react';

import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import MenuItem from '@material-ui/core/MenuItem';

import { CascadingMenuItem } from './types';

import StyledText from './StyledText';

const useStyles = makeStyles((theme) => ({
  layer: {
    display: 'inline-block',
    width: theme.spacing(35),
    height: '100%',
    overflowY: 'auto',
    verticalAlign: 'top',

    '&:not(:last-child)': {
      borderRight: `1px solid rgba(0, 0, 0, 0.2)`,
    },
  },

  menuItem: {
    paddingLeft: theme.spacing(1.2),
    height: 'auto',
    fontWeight: theme.typography.subtitle1.fontWeight,
  },

  active: {
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
  },

  subMenuArrow: {
    position: 'absolute',
    right: theme.spacing(0.5),
    fontSize: theme.spacing(3),
  },

  selected: {
    backgroundColor: `${theme.palette.action.selected} !important`,
    color: `${theme.palette.text.primary} !important`,
  },

  label: {
    padding: theme.spacing(1.75, 2.75),
    color: theme.palette.group.leaf,
  },
}));

interface LayerProps {
  menu: CascadingMenuItem[];
  path?: string;
  selectedPath?: string;
  onSelectedPathChange: (selectedPath: string) => void;
}

const Layer: VoidFunctionComponent<LayerProps> = ({
  menu,
  path = '',
  selectedPath,
  onSelectedPathChange,
}: LayerProps) => {
  const classes = useStyles();

  const items = useMemo(
    () =>
      menu.map((item) => ({
        ...item,
        fullPath: path ? `${path}.${item.id}` : item.id,
      })),
    [menu, path],
  );

  const selectedItem = useMemo(
    () => items.find((item) => selectedPath?.startsWith(item.fullPath)),
    [items, selectedPath],
  );

  return (
    <>
      <div className={classes.layer}>
        {items.map((item) => (
          <MenuItem
            classes={{
              root: classes.menuItem,
              selected: classes.selected,
            }}
            selected={item.id === selectedItem?.id}
            onClick={() => {
              onSelectedPathChange(item.fullPath);
            }}
            key={item.id}
          >
            {item.color ? (
              <StyledText color={item.color} contained={item.fill} border={item.border}>
                {item.label}
                {item.appendLabel}
              </StyledText>
            ) : (
              <span className={classes.label}>
                {item.label}
                {item.appendLabel}
              </span>
            )}
            {!!item.subMenu && <ChevronRightIcon className={classes.subMenuArrow} />}
          </MenuItem>
        ))}
      </div>
      {!!selectedItem?.subMenu && (
        <Layer
          menu={selectedItem.subMenu}
          path={selectedItem.fullPath}
          selectedPath={selectedPath}
          onSelectedPathChange={onSelectedPathChange}
        />
      )}
    </>
  );
};

export default Layer;
