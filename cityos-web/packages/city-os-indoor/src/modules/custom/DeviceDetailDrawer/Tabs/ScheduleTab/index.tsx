import { makeStyles, useTheme } from '@material-ui/core/styles';

import React, { VoidFunctionComponent } from 'react';

import AddIcon from '@material-ui/icons/Add';
import Switch from '@material-ui/core/Switch';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

import StatusChip from 'city-os-common/modules/StatusChip';
import ThemeIconButton from 'city-os-common/modules/ThemeIconButton';

import AddScheduleDialog from './AddScheduleDialog';
import ControlGroup from './ControlGroup';
import WeekSelector from './WeekSelector';

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

const ScheduleTab: VoidFunctionComponent = () => {
  const classes = useStyles();
  const theme = useTheme();

  const [isAddScheduleDialogOpen, setIsAddScheduleDialogOpen] = React.useState<boolean>(false);

  const handleAddScheduleDialogOpen = () => {
    setIsAddScheduleDialogOpen(true);
  };

  const handleAddScheduleDialogClose = () => {
    setIsAddScheduleDialogOpen(false);
  };

  return (
    <>
      <TableContainer className={classes.root}>
        <Table aria-label="simple table">
          <TableHead>
            <TableRow className={classes.tableHead}>
              <TableCell width={400}>Freqency</TableCell>
              <TableCell>Excute date</TableCell>
              <TableCell>Excute time</TableCell>
              <TableCell>ACTION</TableCell>
              <TableCell />
              <TableCell width={120} />
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow className={classes.tableRow}>
              <TableCell>
                <WeekSelector readonly defaultValue={[0, 3, 4]} />
              </TableCell>
              <TableCell />
              <TableCell>18:00:00</TableCell>
              <TableCell>
                <StatusChip color="done" label="ON" />
              </TableCell>
              <TableCell align="right" style={{ width: theme.spacing(0) }}>
                <Switch color="primary" />
              </TableCell>
              <TableCell>
                <ControlGroup />
              </TableCell>
            </TableRow>
            <TableRow className={classes.tableRow}>
              <TableCell>
                <WeekSelector readonly defaultValue={[2, 3, 6]} />
              </TableCell>
              <TableCell />
              <TableCell>18:00:00</TableCell>
              <TableCell>
                <StatusChip color="error" label="OFF" />
              </TableCell>
              <TableCell align="right" style={{ width: theme.spacing(0) }}>
                <Switch defaultChecked color="primary" />
              </TableCell>
              <TableCell>
                <ControlGroup />
              </TableCell>
            </TableRow>
            <TableRow className={classes.tableRow}>
              <TableCell />
              <TableCell>06-May-22</TableCell>
              <TableCell>18:00:00</TableCell>
              <TableCell>
                <StatusChip color="done" label="ON" />
              </TableCell>
              <TableCell align="right" style={{ width: theme.spacing(0) }}>
                <Switch color="primary" />
              </TableCell>
              <TableCell>
                <ControlGroup />
              </TableCell>
            </TableRow>
            <TableRow className={classes.tableRow}>
              <TableCell />
              <TableCell>06-May-22</TableCell>
              <TableCell>18:00:00</TableCell>
              <TableCell>
                <StatusChip color="pending" label="RESET" />
              </TableCell>
              <TableCell align="right" style={{ width: theme.spacing(0) }}>
                <Switch defaultChecked color="primary" />
              </TableCell>
              <TableCell>
                <ControlGroup />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
        <div className={classes.addIconBar}>
          <ThemeIconButton variant="outlined" tooltip="Add" onClick={handleAddScheduleDialogOpen}>
            <AddIcon fontSize="inherit" />
          </ThemeIconButton>
        </div>
      </TableContainer>
      <AddScheduleDialog open={isAddScheduleDialogOpen} onClose={handleAddScheduleDialogClose} />
    </>
  );
};

export default ScheduleTab;
