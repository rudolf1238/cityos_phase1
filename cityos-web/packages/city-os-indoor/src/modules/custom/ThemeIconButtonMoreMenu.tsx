import { makeStyles } from '@material-ui/core/styles';

import React, { FunctionComponent, memo } from 'react';

import { PopoverOrigin } from '@material-ui/core/Popover';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';
import Tooltip from '@material-ui/core/Tooltip';

import { bindMenu, bindTrigger, usePopupState } from 'material-ui-popup-state/hooks';
import clsx from 'clsx';

import useIndoorTranslation from '../../hooks/useIndoorTranslation';

const useStyles = makeStyles((theme) => ({
  menuPaper: {
    border: `1px solid ${theme.palette.grey[400]}`,
    marginTop: theme.spacing(8),
  },

  menuList: {
    paddingTop: 0,
    paddingBottom: 0,
  },

  menuItem: {
    height: theme.spacing(7),
    color: theme.palette.type === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
    '&::after': {
      content: 'none',
    },
  },

  headerIconButton: {
    width: theme.spacing(7),
    height: theme.spacing(7),
    color: theme.palette.primary.main,
    '&:hover': {
      backgroundColor: theme.palette.type === 'dark' ? '#1a58f9' : 'rgba(37, 178, 255, 0.04)',
      color: theme.palette.type === 'dark' ? '#fff' : theme.palette.primary.main,
    },
  },

  tooltip: {
    marginTop: 0,
    color: theme.palette.text.primary,
    fontWeight: theme.typography.subtitle2.fontWeight,
    fontSize: theme.typography.subtitle2.fontSize,
    backgroundColor: 'transparent',
  },

  errorColor: {
    color: theme.palette.error.main,
    '&:hover': {
      color: theme.palette.error.main,
    },
  },
}));

export interface ThemeIconButtonMoreMenuItem {
  id: string;
  label: string;
  onClick?: React.MouseEventHandler<HTMLLIElement | HTMLButtonElement>;
  errorColor?: boolean;
}

export interface ThemeIconButtonMoreMenuProps {
  menuItemList: (ThemeIconButtonMoreMenuItem | null)[];
  menuProps?: {
    anchorOrigin?: PopoverOrigin | undefined;
    transformOrigin?: PopoverOrigin | undefined;
  };
}

const ThemeIconButtonMoreMenu: FunctionComponent<ThemeIconButtonMoreMenuProps> = (
  props: ThemeIconButtonMoreMenuProps,
) => {
  const { menuItemList, menuProps } = props;

  const classes = useStyles();

  const { t } = useIndoorTranslation('common');

  const popupState = usePopupState({ variant: 'popover', popupId: 'moreMenu' });

  return (
    <div>
      <Tooltip
        title={t('common:More') as React.ReactChild}
        classes={{
          tooltipPlacementBottom: classes.tooltip,
        }}
      >
        <IconButton
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...bindTrigger(popupState)}
          aria-label={t('common:More')}
          className={classes.headerIconButton}
        >
          <MoreHorizIcon />
        </IconButton>
      </Tooltip>
      <Menu
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...bindMenu(popupState)}
        classes={{
          paper: classes.menuPaper,
          list: classes.menuList,
        }}
        {...menuProps}
      >
        {menuItemList.map(
          (menuItem) =>
            menuItem && (
              <MenuItem
                key={menuItem.id}
                onClick={menuItem.onClick}
                className={clsx(classes.menuItem, menuItem.errorColor ? classes.errorColor : '')}
              >
                {menuItem.label}
              </MenuItem>
            ),
        )}
      </Menu>
    </div>
  );
};

export default memo(ThemeIconButtonMoreMenu);
