import { makeStyles, useTheme } from '@material-ui/core/styles';
import React, { VoidFunctionComponent, memo } from 'react';
import clsx from 'clsx';

import Avatar from '@material-ui/core/Avatar';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

import OverflowTooltip from 'city-os-common/modules/OverflowTooltip';

import { Curve, Duration, GadgetSize } from '../../libs/type';
import { defaultColors } from '../../libs/constants';

import LineCharts from '../LineCharts';
import ResponsiveTypography from '../ResponsiveTypography';

const useStyles = makeStyles((theme) => ({
  root: {
    flex: 1,
    minHeight: 0,
  },

  textWrapper: {
    display: 'flex',
    gap: theme.spacing(1),
    alignItems: 'center',

    '& > svg': {
      color: theme.palette.info.main,
    },
  },

  item: {
    padding: theme.spacing(0, 1, 0, 0.5),
    width: '100%',
    minWidth: 0,
  },

  squareItem: {
    height: '50%',
  },

  rectangleItem: {
    height: '100%',
  },

  titleWrapper: {
    height: '30%',
  },

  avatarsWrapper: {
    position: 'relative',
    flex: 1,
    gap: `${(100 - 92) / 4}%`,
    justifyContent: 'center',
    height: `${100 - 30}%`,
  },

  avatarWrapper: {
    display: 'flex',
    flexDirection: 'column',
    width: `${92 / 5}%`,

    '& > span': {
      paddingTop: theme.spacing(1),
      direction: 'rtl',
    },
  },

  avatar: {
    backgroundColor: theme.palette.background.light,
    paddingBottom: '100%',
    width: '100%',

    '& > h3': {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
    },
  },
}));

interface MultiFlowsLineChartProps {
  setting: {
    duration: Duration;
    size: GadgetSize;
    title: string;
    icon: JSX.Element;
  };
  start: number;
  currentValues: Record<string, number | undefined>;
  curves?: Curve[];
}

const MultiFlowsLineChart: VoidFunctionComponent<MultiFlowsLineChartProps> = ({
  setting: { duration, size, title, icon },
  start,
  currentValues,
  curves,
}: MultiFlowsLineChartProps) => {
  const classes = useStyles();
  const theme = useTheme();

  return (
    <Grid
      container
      className={classes.root}
      direction={size === GadgetSize.SQUARE ? 'column' : 'row'}
      wrap="nowrap"
    >
      <Grid
        item
        container
        direction="column"
        wrap="nowrap"
        alignItems="center"
        className={clsx(
          classes.item,
          size === GadgetSize.SQUARE ? classes.squareItem : classes.rectangleItem,
        )}
      >
        <Grid container item alignItems="center" justify="center" className={classes.titleWrapper}>
          <div className={classes.textWrapper}>
            {icon}
            <Typography variant="h6">{title}</Typography>
          </div>
        </Grid>
        <Grid container item alignItems="center" className={classes.avatarsWrapper}>
          {curves &&
            curves.map((curve, index) => {
              const value = currentValues?.[curve.key];
              const currentValue = value === undefined ? '---' : value.toLocaleString('en-US');
              return (
                <div key={curve.key} className={classes.avatarWrapper}>
                  <Avatar
                    style={{ color: theme.palette.gadget[defaultColors[index]] }}
                    className={classes.avatar}
                  >
                    <ResponsiveTypography
                      variant="h3"
                      text={currentValue}
                      maxWidth={60}
                      maxFontSize={32}
                    />
                  </Avatar>
                  <OverflowTooltip title={curve.label || ''}>
                    <Typography variant="overline" noWrap>
                      {curve.label}
                    </Typography>
                  </OverflowTooltip>
                </div>
              );
            })}
        </Grid>
      </Grid>
      <Grid
        item
        className={clsx(
          classes.item,
          size === GadgetSize.SQUARE ? classes.squareItem : classes.rectangleItem,
        )}
      >
        {curves && <LineCharts start={start} curves={curves} duration={duration} />}
      </Grid>
    </Grid>
  );
};

export default memo(MultiFlowsLineChart);
