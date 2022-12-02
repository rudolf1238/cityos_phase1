import { makeStyles } from '@material-ui/core/styles';

import React, { VoidFunctionComponent } from 'react';

import { DatePicker, TimePicker } from '@material-ui/pickers';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import KeyboardArrowLeftIcon from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';

import BaseDialog from 'city-os-common/modules/BaseDialog';

import WeekSelector from './WeekSelector';
import useIndoorTranslation from '../../../../../hooks/useIndoorTranslation';

const useStyle = makeStyles((theme) => ({
  root: {
    width: theme.spacing(45),
  },

  dialogRoot: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: 600,
    maxWidth: '90vw',
  },

  dialogContent: {
    // marginTop: theme.spacing(2),
    width: `calc(100% - ${theme.spacing(2)}px)`,
    maxWidth: 480,
    overflow: 'hidden',
  },

  contentRoot: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(6),
    alignItems: 'center',
    marginTop: theme.spacing(4),
  },

  scheduleModeSelector: {
    display: 'flex',
    gap: theme.spacing(1),
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
}));

export interface AddScheduleDialogProps {
  open?: boolean;
  onClose?: VoidFunction;
}

const AddScheduleDialog: VoidFunctionComponent<AddScheduleDialogProps> = (
  props: AddScheduleDialogProps,
) => {
  const { open = false, onClose = () => {} } = props;

  const classes = useStyle();
  const { t } = useIndoorTranslation();

  const [tabIndex, setTabIndex] = React.useState(0);

  const tabInfoList: { label: string; content: React.ReactNode }[] = [
    {
      label: 'Freqency',
      content: <WeekSelector />,
    },
    {
      label: 'Excute date',
      content: <DatePicker value={new Date()} onChange={() => {}} style={{ width: '80%' }} />,
    },
  ];

  const handleModeChange = (offset: number) => {
    setTabIndex((tabIndex + offset) % tabInfoList.length);
  };

  return (
    <BaseDialog
      open={open}
      title="Add Schdule"
      titleAlign="center"
      onClose={onClose}
      classes={{ dialog: classes.dialogRoot, content: classes.dialogContent }}
      content={
        <div className={classes.contentRoot}>
          <Grid container alignItems="center" spacing={2}>
            <Grid item container spacing={1}>
              <Grid xs={1} container alignItems="center" justify="center" onClick={() => {}}>
                <IconButton
                  size="small"
                  onClick={() => {
                    handleModeChange(-1);
                  }}
                  disabled={tabIndex === 0}
                >
                  <KeyboardArrowLeftIcon />
                </IconButton>
              </Grid>
              <Grid item xs={2} container alignItems="center" justify="center">
                <Typography align="center">{tabInfoList[tabIndex].label}</Typography>
              </Grid>
              <Grid item xs={1} container alignItems="center" justify="center">
                <IconButton
                  size="small"
                  onClick={() => {
                    handleModeChange(1);
                  }}
                  disabled={tabIndex === tabInfoList.length - 1}
                >
                  <KeyboardArrowRightIcon />
                </IconButton>
              </Grid>
              <Grid item xs={8} container alignItems="center" style={{ paddingLeft: 16 }}>
                {tabInfoList[tabIndex].content}
              </Grid>
            </Grid>

            <Grid item xs={1} />
            <Grid item xs={2} container alignItems="center" justify="center">
              <Typography align="center">Excute time</Typography>
            </Grid>
            <Grid item xs={1} />
            <Grid item xs={8} style={{ paddingLeft: 16 }}>
              <TimePicker value={new Date()} onChange={() => {}} style={{ width: '80%' }} />
            </Grid>

            <Grid item xs={1} />
            <Grid item xs={2} container alignItems="center" justify="center">
              <Typography>ACTION</Typography>
            </Grid>
            <Grid item xs={1} />
            <Grid item xs={8} style={{ paddingLeft: 16 }}>
              <TextField select defaultValue="OFF" style={{ width: '80%' }}>
                <MenuItem key="ON" value="ON">
                  ON
                </MenuItem>
                <MenuItem key="OFF" value="OFF">
                  OFF
                </MenuItem>
                <MenuItem key="RESET" value="RESET">
                  RESET
                </MenuItem>
              </TextField>
            </Grid>
          </Grid>
          <Button variant="contained" color="primary" size="small" style={{ marginTop: 8 }}>
            {t('common:Create')}
          </Button>
        </div>
      }
    />
  );
};

export default AddScheduleDialog;
