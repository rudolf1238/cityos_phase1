import React, { FunctionComponent, PropsWithChildren } from 'react';

import {
  Step,
  StepConnector,
  StepIconProps,
  StepLabel,
  Stepper,
  withStyles,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import CheckIcon from '@material-ui/icons/Check';
import clsx from 'clsx';

const useStyles = makeStyles((theme) => ({
  label: {
    fontSize: 16,
    color: theme.palette.type === 'dark' ? 'rgba(255, 255, 255, 0.26)' : 'rgba(0, 0, 0, 0.7)',
    fontWeight: 'normal',
    '&$completed': {
      fontWeight: 'normal',
    },
  },
  completed: {},
}));

export interface IStep {
  key: string;
  label: string;
  content?: string | React.ReactNode;
}

export interface ThemeStepperProps {
  stepList: IStep[];
  activeStep: number;
}

const ThemeConnector = withStyles((theme) => ({
  active: {
    '& $line': {
      borderColor: theme.palette.primary.main,
    },
  },
  completed: {
    '& $line': {
      borderColor: theme.palette.primary.main,
    },
  },
  line: {
    margin: theme.spacing(0, 0.5, 0, 0.5),
  },
}))(StepConnector);

const useThemeStepIconStyles = makeStyles((theme) => ({
  root: {
    color: theme.palette.type === 'dark' ? '#1d3460' : '#fff',
    backgroundColor:
      theme.palette.type === 'dark' ? 'rgba(255, 255, 255, 0.26)' : 'rgba(0, 0, 0, 0.26)',
    borderRadius: '50%',
    height: 24,
    width: 24,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontWeight: 'bold',
    lineHeight: 'normal',
    fontSize: 'initial',
  },
  active: {
    color: '#fff',
    backgroundColor: theme.palette.primary.main,
  },
  completed: {
    color: '#fff',
    backgroundColor: theme.palette.primary.main,
    borderRadius: '50%',
    padding: 3,
    strokeWidth: 1,
    stroke: '#fff',
    height: 24,
    width: 24,
  },
}));

const ThemeStepIcon = (props: StepIconProps) => {
  const classes = useThemeStepIconStyles();
  const { active, completed, icon } = props;

  return (
    <div
      className={clsx(classes.root, {
        [classes.active]: active,
      })}
    >
      {completed ? <CheckIcon className={classes.completed} /> : icon}
    </div>
  );
};

const ThemeStepper: FunctionComponent<ThemeStepperProps> = ({
  stepList,
  activeStep,
}: PropsWithChildren<ThemeStepperProps>) => {
  const classes = useStyles();

  return (
    <Stepper activeStep={activeStep} connector={<ThemeConnector />}>
      {stepList.map((step) => (
        <Step key={step.key}>
          <StepLabel
            StepIconComponent={ThemeStepIcon}
            classes={{
              label: classes.label,
              completed: classes.completed,
            }}
          >
            {step.label}
          </StepLabel>
        </Step>
      ))}
    </Stepper>
  );
};

export default ThemeStepper;
