import { makeStyles, useTheme } from '@material-ui/core/styles';

import React, { FunctionComponent, memo, useMemo } from 'react';

import Button from '@material-ui/core/Button';
import ExpandMoreRoundedIcon from '@material-ui/icons/ExpandMoreRounded';
import Menu from '@material-ui/core/Menu';

import { bindMenu, bindTrigger, usePopupState } from 'material-ui-popup-state/hooks';
import styled from '@emotion/styled';

import ThemeButton from './ThemeButton';

const useStyles = makeStyles((theme) => ({
  menuPaper: {
    backgroundColor: '#00000000',
    marginTop: theme.spacing(8),
    width: theme.spacing(26),
    boxShadow: 'none',
    border: 0,
  },
  menuList: {
    paddingTop: '0.2em',
    paddingBottom: 0,
    maxHeight: '75vh',
  },
  headerButton: {
    width: theme.spacing(26),
    height: theme.spacing(7),
    padding: 'unset',
    borderRadius: theme.spacing(3.5),
    backgroundColor: theme.palette.type === 'dark' ? '#1b2f64' : '#ffffff',
    borderColor: theme.palette.type === 'dark' ? '#1b2f64' : theme.palette.primary.main,
    '&:hover': {
      backgroundColor: theme.palette.type === 'dark' ? '' : '#f5f5f5',
      borderColor: theme.palette.type === 'dark' ? '' : theme.palette.primary.main,
    },
  },
  headerButtonTitle: {
    color: theme.palette.type === 'dark' ? '#ffffff' : '#4f4f4f',
  },
}));

export interface ThemeButtonMoreMenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}
export interface ThemeButtonMoreMenuProps {
  style?: React.CSSProperties;
  itemList: ThemeButtonMoreMenuItem[];
  selectedItemId: string;
  handleChange: (id: string) => void;
}

const getSelectItem = (itemList: ThemeButtonMoreMenuItem[], id: string) =>
  itemList.filter((item: ThemeButtonMoreMenuItem) => item.id === id)[0];

const getUnSelectItemList = (itemList: ThemeButtonMoreMenuItem[], id: string) =>
  itemList.filter((item: ThemeButtonMoreMenuItem) => item.id !== id);

const ThemeButtonMoreMenu: FunctionComponent<ThemeButtonMoreMenuProps> = (
  props: ThemeButtonMoreMenuProps,
) => {
  const { style, itemList, selectedItemId, handleChange } = props;

  const classes = useStyles();
  const popupState = usePopupState({ variant: 'popover', popupId: 'moreMenu' });

  const theme = useTheme();

  const CustomButton = useMemo(
    () =>
      styled(Button)({
        '& .MuiButton-startIcon': {
          marginLeft: '0.5em',
        },
        '& .MuiButton-endIcon': {
          marginLeft: '1em',
          color: theme.palette.type === 'dark' ? '#ffffff80' : '#757575',
          '& > *:first-of-type': {
            fontSize: 27,
          },
        },
      }),
    [theme.palette.type],
  );

  return (
    <div>
      <CustomButton
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...bindTrigger(popupState)}
        style={style}
        variant="outlined"
        color="primary"
        className={classes.headerButton}
        startIcon={getSelectItem(itemList, selectedItemId)?.icon}
        endIcon={<ExpandMoreRoundedIcon />}
      >
        <span className={classes.headerButtonTitle}>
          {getSelectItem(itemList, selectedItemId)?.label}
        </span>
      </CustomButton>
      <Menu
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...bindMenu(popupState)}
        classes={{
          paper: classes.menuPaper,
          list: classes.menuList,
        }}
      >
        {getUnSelectItemList(itemList, selectedItemId).map((item) => (
          <ThemeButton
            key={item.id}
            style={{ marginBottom: '0.5em' }}
            startIcon={item.icon}
            onClick={() => {
              handleChange(item.id);
            }}
          >
            {item.label}
          </ThemeButton>
        ))}
      </Menu>
    </div>
  );
};

export default memo(ThemeButtonMoreMenu);
