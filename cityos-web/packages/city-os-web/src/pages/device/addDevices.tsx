import { makeStyles } from '@material-ui/core/styles';
import { useQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import React, { VoidFunctionComponent, useCallback, useMemo, useState } from 'react';

import CircularProgress from '@material-ui/core/CircularProgress';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import Stepper from '@material-ui/core/Stepper';
import Typography from '@material-ui/core/Typography';

import { Action, DeviceType, IDevice, Subject } from 'city-os-common/libs/schema';
import { isNotEmpty, isString } from 'city-os-common/libs/validators';
import { useStore } from 'city-os-common/reducers';
import ErrorCode from 'city-os-common/libs/errorCode';
import isGqlError from 'city-os-common/libs/isGqlError';
import subjectRoutes from 'city-os-common/libs/subjectRoutes';

import CheckCircleIcon from 'city-os-common/assets/icon/checkCheckbox.svg';
import Guard from 'city-os-common/modules/Guard';
import Header from 'city-os-common/modules/Header';
import MainLayout from 'city-os-common/modules/MainLayout';
import PageContainer from 'city-os-common/modules/PageContainer';

import {
  DEVICES_FROM_IOT,
  DevicesFromIOTPayload,
  DevicesFromIOTResponse,
} from '../../api/devicesFromIOT';
import useWebTranslation from '../../hooks/useWebTranslation';

import SelectDevices from '../../modules/Devices/SelectDevices';
import SetFilter, { FilterPayload } from '../../modules/Devices/SetFilter';

const useStyles = makeStyles((theme) => ({
  titleAttachment: {
    display: 'flex',
    flex: 1,
    justifyContent: 'space-between',
    marginLeft: theme.spacing(10),

    [theme.breakpoints.down('sm')]: {
      marginLeft: 0,
    },
  },

  stepper: {
    backgroundColor: 'transparent',
    padding: 0,
    width: theme.spacing(48),
    color: theme.palette.primary.main,
  },

  step: {
    padding: theme.spacing(0, 3),
  },

  stepLabel: {
    fontSize: theme.typography.fontSize,
  },

  icon: {
    width: 26,
    height: 26,
  },

  iconText: {
    fontWeight: theme.typography.h4.fontWeight,
  },

  info: {
    display: 'flex',
    flexDirection: 'column',

    '& > * + *': {
      marginTop: theme.spacing(2),
    },
  },

  loading: {
    marginTop: theme.spacing(10),
    width: '100%',
    textAlign: 'center',
  },
}));

const AddDevices: VoidFunctionComponent = () => {
  const { t } = useWebTranslation(['device', 'common']);
  const classes = useStyles();
  const router = useRouter();
  const {
    userProfile: { divisionGroup, permissionGroup },
  } = useStore();

  const [activeStep, setActiveStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(new Set<number>());
  const [name, setName] = useState<string | null>(null);
  const [type, setType] = useState<DeviceType | null>(null);
  const [desc, setDesc] = useState<string | null>(null);
  const steps = [t('device:Set filter'), t('common:Select devices')];

  const backLink = isString(router.query.back) ? router.query.back : undefined;
  const groupId = isString(router.query.gid) ? router.query.gid : '';

  const { data: iotDeviceData, loading, error } = useQuery<
    DevicesFromIOTResponse,
    DevicesFromIOTPayload
  >(DEVICES_FROM_IOT, {
    skip: !permissionGroup?.group?.id || !groupId,
    variables: {
      groupId,
      name,
      type: type || null,
      desc,
    },
    fetchPolicy: 'cache-and-network',
  });

  const deviceList = useMemo<Omit<IDevice, 'hasLightSensor' | 'lightSchedule' | 'related'>[]>(
    () => iotDeviceData?.devicesFromIOT?.filter(isNotEmpty) || [],
    [iotDeviceData?.devicesFromIOT],
  );

  const handleFilterClick = useCallback(
    (value: FilterPayload) => {
      if (activeStep === 0) {
        setName(value.deviceName ?? null);
        setDesc(value.description ?? null);
        setType((_prev) => {
          if (value.deviceType === 'ALL') return null;
          return value.deviceType;
        });
        setCompletedSteps((prev) => prev.add(activeStep));
        setActiveStep((prev) => prev + 1);
      } else {
        setName(null);
        setDesc(null);
        setType(null);
        setCompletedSteps(new Set<number>());
        setActiveStep(0);
      }
    },
    [activeStep],
  );

  const isForbidden = useMemo(() => isGqlError(error, ErrorCode.FORBIDDEN), [error]);

  return (
    <MainLayout>
      <Guard subject={Subject.DEVICE} action={Action.ADD} forbidden={isForbidden}>
        <PageContainer>
          <Header
            title={t('device:Add Devices')}
            backLinkText={t('device:Device Management')}
            backLinkHref={backLink || subjectRoutes[Subject.DEVICE]}
          >
            <div className={classes.titleAttachment}>
              <Stepper activeStep={activeStep} className={classes.stepper}>
                {steps.map((label, index) => {
                  const completed = completedSteps.has(index);
                  return (
                    <Step key={label} className={classes.step} completed={completed}>
                      <StepLabel
                        StepIconProps={{
                          classes: { root: classes.icon, text: classes.iconText },
                          ...(completed && { icon: <CheckCircleIcon className={classes.icon} /> }),
                        }}
                        classes={{ label: classes.stepLabel }}
                      >
                        {label}
                      </StepLabel>
                    </Step>
                  );
                })}
              </Stepper>
            </div>
            <div className={classes.info}>
              <Typography variant="body2" align="right">
                {t('common:Division')}
              </Typography>
              <Typography variant="body2" align="right">
                {divisionGroup?.name}
              </Typography>
            </div>
          </Header>
          <SetFilter activeStep={activeStep} onClick={handleFilterClick} />
          {activeStep === 1 && (
            <>
              {loading && (
                <div className={classes.loading}>
                  <CircularProgress />
                </div>
              )}
              {!loading && iotDeviceData && (
                <SelectDevices groupId={groupId} deviceList={deviceList} backLink={backLink} />
              )}
            </>
          )}
        </PageContainer>
      </Guard>
    </MainLayout>
  );
};

export default AddDevices;
