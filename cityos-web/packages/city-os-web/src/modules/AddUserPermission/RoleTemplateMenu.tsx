import { makeStyles } from '@material-ui/core/styles';
import React, { VoidFunctionComponent } from 'react';

import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

import { Rule } from 'city-os-common/libs/schema';

import { RoleTemplate } from '../../libs/schema';

const useStyles = makeStyles(() => ({
  menuPaper: {
    width: 256,
    maxHeight: 300,
  },
}));

interface RoleTemplateMenuProps {
  open: boolean;
  anchorEl: HTMLElement | null;
  roleTemplateList: Required<RoleTemplate>[];
  onClose: () => void;
  onSelect: (permission: Rule[]) => void;
}

const RoleTemplateMenu: VoidFunctionComponent<RoleTemplateMenuProps> = ({
  open,
  anchorEl,
  roleTemplateList,
  onClose,
  onSelect,
}: RoleTemplateMenuProps) => {
  const classes = useStyles();

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      getContentAnchorEl={null}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      classes={{
        paper: classes.menuPaper,
      }}
    >
      {roleTemplateList.map(({ id, name, permission }) => (
        <MenuItem
          key={id}
          onClick={() => {
            onSelect(permission?.rules || []);
            onClose();
          }}
        >
          {name}
        </MenuItem>
      ))}
    </Menu>
  );
};

export default RoleTemplateMenu;
