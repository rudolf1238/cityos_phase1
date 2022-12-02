/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable import/no-extraneous-dependencies */
import React, { FunctionComponent, PropsWithChildren, ReactNode } from 'react';

import { Divider, List, ListItem, ListItemAvatar, ListItemText } from '@material-ui/core';
import Avatar from '@mui/material/Avatar';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';

import { green } from '@material-ui/core/colors';

interface InputProps {
  name?: string;
  email?: string;
  messageList?: any;
}

const MenuItem: FunctionComponent<InputProps> = ({
  name,
  email,
}: PropsWithChildren<InputProps>) => (
  <List>
    <ListItem alignItems="flex-start">
      <ListItemAvatar>
        <Avatar sx={{ bgcolor: green[500] }}>
          <ManageAccountsIcon />
        </Avatar>

        {/* <Avatar alt="Remy Sharp" src="/static/images/avatar/1.jpg" /> */}
      </ListItemAvatar>
      <ListItemText>
        <span>{name}</span>
        <br />
        {email}
      </ListItemText>
      <Divider />
    </ListItem>
    <Divider variant="inset" component="li" />
  </List>
);

function getmessageListItems(menuItems: InputProps[]): ReactNode[] {
  return menuItems.reduce<ReactNode[]>(
    (acc, { name, email }) => acc.concat(<MenuItem name={name} email={email} />),
    [],
  );
}

const UserDetail: FunctionComponent<InputProps> = ({
  messageList,
}: PropsWithChildren<InputProps>) => {
  const messageListItem = getmessageListItems(messageList);
  const messageList1 = messageListItem;
  return <div>{messageList1}</div>;
};

export default UserDetail;
