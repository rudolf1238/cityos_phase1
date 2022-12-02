import { makeStyles } from '@material-ui/core/styles';
import React, { ChangeEvent, FunctionComponent, useCallback } from 'react';

import FormControl from '@material-ui/core/FormControl';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Typography from '@material-ui/core/Typography';

import { isString } from '../../libs/validators';
import { useStore } from '../../reducers';
import ReducerActionType from '../../reducers/actions';
import useCommonTranslation from '../../hooks/useCommonTranslation';

const useStyles = makeStyles((theme) => ({
  root: {
    color: theme.palette.info.main,
    fontWeight: theme.typography.subtitle1.fontWeight,

    '& .MuiSelect-outlined': {
      paddingRight: theme.spacing(8),
    },

    '& .MuiOutlinedInput-notchedOutline': {
      borderWidth: 0,
    },
  },

  select: {
    '&:focus': {
      backgroundColor: theme.palette.background.default,
    },
  },

  menu: {
    marginTop: theme.spacing(3),
  },

  menuItem: {
    color: theme.palette.group.leaf,
    fontSize: theme.typography.subtitle1.fontSize,
    fontWeight: theme.typography.subtitle2.fontWeight,

    '&:hover': {
      color: theme.palette.group.leaf,
    },

    '&.MuiListItem-button.Mui-selected': {
      color: theme.palette.group.leaf,

      '&:hover': {
        color: theme.palette.primary.contrastText,
      },
    },
  },

  noDivision: {
    padding: theme.spacing(2),
    color: theme.palette.info.main,
  },
}));

const PermissionSelector: FunctionComponent = () => {
  const classes = useStyles();
  const {
    userProfile: { profile, permissionGroup },
    dispatch,
  } = useStore();
  const { t } = useCommonTranslation('mainLayout');

  const handleChange = useCallback(
    async (e: ChangeEvent<{ value: unknown }>) => {
      const groupId = e.target.value;
      if (!isString(groupId)) return;
      dispatch({
        type: ReducerActionType.SetPermissionGroup,
        payload: {
          permissionGroupId: groupId,
        },
      });
    },
    [dispatch],
  );

  return (
    <>
      {permissionGroup?.group.id ? (
        <FormControl>
          <Select
            value={permissionGroup.group.id}
            onChange={handleChange}
            variant="outlined"
            MenuProps={{
              anchorOrigin: {
                vertical: 'bottom',
                horizontal: 'left',
              },
              getContentAnchorEl: null,
              className: classes.menu,
            }}
            className={classes.root}
            classes={{ root: classes.select }}
          >
            {profile?.groups.map(({ group }) => (
              <MenuItem key={group.id} value={group.id} className={classes.menuItem}>
                {group.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      ) : (
        <Typography variant="subtitle1" className={classes.noDivision}>
          {t('Empty division')}
        </Typography>
      )}
    </>
  );
};

export default PermissionSelector;
