import { makeStyles } from '@material-ui/core/styles';
import { useMutation } from '@apollo/client';
import { useRouter } from 'next/router';
import React, { FunctionComponent, memo, useCallback, useState } from 'react';

import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

import { LOGOUT, LogoutPayload, LogoutResponse } from '../../../api/logout';
import { useStore } from '../../../reducers';
import ReducerActionType from '../../../reducers/actions';
import useCommonTranslation from '../../../hooks/useCommonTranslation';

import ChangePassword from './ChangePassword';
import UserProfile from './UserProfile';

const useStyles = makeStyles(() => ({
  menuPaper: {
    marginTop: 0,
  },
}));

interface ProfileMenuProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
}

type ProfileMenuItem = 'profile' | 'changePassword';

const ProfileMenu: FunctionComponent<ProfileMenuProps> = ({
  anchorEl,
  onClose,
}: ProfileMenuProps) => {
  const classes = useStyles();
  const { t } = useCommonTranslation(['profileMenu', 'mainLayout']);
  const router = useRouter();
  const { dispatch, user } = useStore();

  const [openItem, setOpenItem] = useState<ProfileMenuItem>();

  const [logout] = useMutation<LogoutResponse, LogoutPayload>(LOGOUT);

  const handleOpenItem = useCallback(
    (item: ProfileMenuItem) => () => {
      setOpenItem(item);
      onClose();
    },
    [onClose],
  );

  const handleCloseItem = useCallback(() => {
    setOpenItem(undefined);
    onClose();
  }, [onClose]);

  const handleLogout = useCallback(async () => {
    await router.push('/');
    try {
      await logout({
        variables: {
          refreshToken: user?.refreshToken || '',
        },
      });
    } catch (error) {
      if (D_DEBUG) console.error(error);
    }
    dispatch({
      type: ReducerActionType.UserLogout,
    });
  }, [router, dispatch, logout, user?.refreshToken]);

  return (
    <>
      <Menu
        anchorEl={anchorEl}
        open={!!anchorEl}
        onClose={onClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        getContentAnchorEl={null}
        PaperProps={{
          elevation: 0,
        }}
        classes={{
          paper: classes.menuPaper,
        }}
      >
        <MenuItem onClick={handleOpenItem('profile')}>{t('profileMenu:User Profile')}</MenuItem>
        <MenuItem onClick={handleOpenItem('changePassword')}>
          {t('profileMenu:Change Password')}
        </MenuItem>
        <MenuItem onClick={handleLogout}>{t('mainLayout:Logout')}</MenuItem>
      </Menu>
      <UserProfile open={openItem === 'profile'} onClose={handleCloseItem} />
      <ChangePassword open={openItem === 'changePassword'} onClose={handleCloseItem} />
    </>
  );
};

export default memo(ProfileMenu);
