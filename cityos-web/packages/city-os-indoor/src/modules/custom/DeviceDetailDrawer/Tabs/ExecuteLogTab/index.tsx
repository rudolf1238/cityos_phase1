import { makeStyles } from '@material-ui/core/styles';

import React, { VoidFunctionComponent } from 'react';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

import StatusChip from 'city-os-common/modules/StatusChip';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    border: 0,
    marginTop: -theme.spacing(1),
  },
  tableHead: {
    backgroundColor: `${theme.palette.background.oddRow} !important`,
  },
  tableRow: {
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.background.evenRow,
    },

    '&:nth-of-type(even)': {
      backgroundColor: theme.palette.background.oddRow,
    },

    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  },

  addIconBar: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(2),
  },
}));

const ExecuteLogTab: VoidFunctionComponent = () => {
  const classes = useStyles();

  return (
    <>
      <TableContainer className={classes.root}>
        <Table aria-label="execute log table">
          <TableHead>
            <TableRow className={classes.tableHead}>
              <TableCell>Excute time</TableCell>
              <TableCell>ACTION</TableCell>
              <TableCell>STATUS</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow className={classes.tableRow}>
              <TableCell>03-May-22 18:00:00</TableCell>
              <TableCell>
                <StatusChip color="done" label="ON" />
              </TableCell>
              <TableCell>
                <StatusChip color="done" label="SUCCESS" />
              </TableCell>
            </TableRow>
            <TableRow className={classes.tableRow}>
              <TableCell>04-May-22 02:00:00</TableCell>
              <TableCell>
                <StatusChip color="error" label="OFF" />
              </TableCell>
              <TableCell>
                <StatusChip color="error" label="ERROR" />
              </TableCell>
            </TableRow>
            <TableRow className={classes.tableRow}>
              <TableCell>05-May-22 02:00:00</TableCell>
              <TableCell>
                <StatusChip color="pending" label="RESET" />
              </TableCell>
              <TableCell>
                <StatusChip color="done" label="SUCCESS" />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default ExecuteLogTab;
