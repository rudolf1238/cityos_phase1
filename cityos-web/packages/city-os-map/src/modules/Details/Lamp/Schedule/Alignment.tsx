import { makeStyles } from '@material-ui/core/styles';
import React, { ChangeEvent, VoidFunctionComponent, useCallback, useMemo, useState } from 'react';
import i18n from 'i18next';

import Button from '@material-ui/core/Button';
import CheckCircleRoundedIcon from '@material-ui/icons/CheckCircleRounded';
import Divider from '@material-ui/core/Divider';
import ExpandMoreRoundedIcon from '@material-ui/icons/ExpandMoreRounded';
import MenuItem from '@material-ui/core/MenuItem';
import RadioButtonUncheckedRoundedIcon from '@material-ui/icons/RadioButtonUncheckedRounded';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';

import { Schedule as ScheduleType } from 'city-os-common/libs/schema';
import formatDate from 'city-os-common/libs/formatDate';
import getTimezoneString from 'city-os-common/libs/getTimezoneString';
import useIsMountedRef from 'city-os-common/hooks/useIsMountedRef';

import BaseDialog from 'city-os-common/modules/BaseDialog';
import OverwriteAlert from 'city-os-common/modules/OverwriteAlert';

import { ScheduleInputItem } from './ScheduleMain/ScheduleProvider';
import useMapTranslation from '../../../../hooks/useMapTranslation';

import ScheduleChart from './ScheduleChart';
import ScheduleSets from './ScheduleSets';

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(5, 4.5),
    width: 1260,
  },

  dialog: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2.5),
    alignItems: 'center',
    width: '100%',
    minWidth: theme.spacing(78),
  },

  subtitleWrapper: {
    width: '100%',
  },

  selectWrapper: {
    margin: 'auto',
    width: theme.spacing(45),
  },

  setsWrapper: {
    width: '100%',
    maxWidth: theme.spacing(110),
  },

  enableController: {
    display: 'flex',
    alignItems: 'center',
    paddingBottom: theme.spacing(2),
  },

  enableText: {
    marginRight: 'auto',
    paddingLeft: theme.spacing(2),
  },

  chartDate: {
    height: theme.spacing(3),
  },

  chartWrapper: {
    margin: 'auto',
    padding: theme.spacing(0, 0, 2, 0),
    width: theme.spacing(55),
    height: theme.spacing(30.5),
  },
}));
interface AlignmentProps {
  scheduleInputs: ScheduleInputItem[];
  callUpdateLampSchedule: (
    newSchedules: ScheduleType[] | null,
    newEnable: boolean,
    targetSchedules: ScheduleInputItem[],
  ) => Promise<void>;
}

const Alignment: VoidFunctionComponent<AlignmentProps> = ({
  scheduleInputs,
  callUpdateLampSchedule,
}: AlignmentProps) => {
  const classes = useStyles();
  const { t } = useMapTranslation(['common', 'column', 'map', 'variables']);
  const isMountedRef = useIsMountedRef();

  const options: ScheduleInputItem[] = useMemo(
    () => [...scheduleInputs].sort((a, b) => a.name.localeCompare(b.name, i18n.language)),
    [scheduleInputs],
  );

  const [showAlignment, setShowAlignment] = useState(false);
  const [selectedInput, setSelectedInput] = useState<ScheduleInputItem>(options[0]);
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleType | null>(null);

  const handleAlignment = useCallback(() => {
    setShowAlignment(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setShowAlignment(false);
  }, []);

  const handleSelect = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const newSelected = scheduleInputs.find((input) => input.deviceId === e.target.value);
      if (newSelected) {
        setSelectedInput(newSelected);
        setSelectedSchedule(null);
      }
    },
    [scheduleInputs],
  );

  const handleApply = useCallback(async () => {
    const { schedules, enableManualSchedule } = selectedInput.manualSchedule;
    await callUpdateLampSchedule(schedules, enableManualSchedule || false, scheduleInputs);
    if (isMountedRef.current) handleCloseDialog();
  }, [selectedInput, scheduleInputs, isMountedRef, callUpdateLampSchedule, handleCloseDialog]);

  return (
    <>
      <OverwriteAlert
        isOpen
        item={t('map:Schedule')}
        buttonLabel={t('map:Alignment')}
        onClick={handleAlignment}
      />
      <BaseDialog
        open={showAlignment}
        onClose={handleCloseDialog}
        title={t('map:Alignment')}
        titleAlign="center"
        classes={{ dialog: classes.paper }}
        content={
          <div className={classes.dialog}>
            <Typography variant="subtitle2" align="left" className={classes.subtitleWrapper}>
              {t('map:Sample device')}
              <Divider />
            </Typography>
            <div className={classes.selectWrapper}>
              <TextField
                onChange={handleSelect}
                value={selectedInput.deviceId}
                variant="outlined"
                type="text"
                label={t('column:Device Name')}
                fullWidth
                select
                InputLabelProps={{ shrink: true }}
                SelectProps={{
                  IconComponent: ExpandMoreRoundedIcon,
                  MenuProps: {
                    getContentAnchorEl: null,
                    anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
                    PaperProps: {
                      variant: 'outlined',
                    },
                  },
                }}
              >
                {options.map(({ deviceId, name }) => (
                  <MenuItem key={deviceId} value={deviceId}>
                    {name}
                  </MenuItem>
                ))}
              </TextField>
            </div>
            <div className={classes.setsWrapper}>
              <div className={classes.enableController}>
                {selectedInput.manualSchedule.enableManualSchedule ? (
                  <CheckCircleRoundedIcon color="disabled" />
                ) : (
                  <RadioButtonUncheckedRoundedIcon color="disabled" />
                )}
                <Typography variant="body1" className={classes.enableText}>
                  {t('map:Enable {{item}}', { item: t('map:Schedule') })}
                </Typography>
                <Typography variant="body1">
                  {t('common:Time Zone')}
                  {': '}
                  {selectedInput.timezone &&
                    getTimezoneString(
                      selectedInput.timezone.timeZoneId,
                      selectedInput.timezone.rawOffset,
                    )}
                </Typography>
              </div>
              {selectedInput.manualSchedule.enableManualSchedule && (
                <>
                  <ScheduleSets
                    schedules={selectedInput.manualSchedule.schedules || []}
                    selectedSchedule={selectedSchedule || null}
                    onSelect={(schedule) => setSelectedSchedule(schedule)}
                  />
                  <Typography variant="h6" align="center" className={classes.chartDate}>
                    {selectedSchedule &&
                      formatDate(
                        {
                          month: selectedSchedule.startMonth - 1,
                          date: selectedSchedule.startDay,
                        },
                        `${t('variables:dateFormat.map.schedule.alignment')}`,
                      )}
                  </Typography>
                  <div className={classes.chartWrapper}>
                    <ScheduleChart
                      controlList={selectedSchedule?.lightControls || []}
                      editable={false}
                    />
                  </div>
                </>
              )}
            </div>
            <Button
              type="button"
              aria-label={t('map:Apply to All')}
              color="primary"
              size="small"
              variant="contained"
              onClick={handleApply}
            >
              {t('map:Apply to All')}
            </Button>
          </div>
        }
      />
    </>
  );
};

export default Alignment;
