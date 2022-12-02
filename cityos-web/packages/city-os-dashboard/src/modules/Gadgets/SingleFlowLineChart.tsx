import { Palette } from '@material-ui/core/styles/createPalette';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import React, { VoidFunctionComponent, useMemo, useRef } from 'react';
import clsx from 'clsx';

import Avatar from '@material-ui/core/Avatar';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

import OverflowTooltip from 'city-os-common/modules/OverflowTooltip';

import { Curve, Duration, GadgetSize } from '../../libs/type';

import LineCharts, { LineChartsProps } from '../LineCharts';
import ResponsiveTypography from '../ResponsiveTypography';

const useStyles = makeStyles((theme) => ({
  root: {
    flex: 1,
    padding: theme.spacing(1),
    minHeight: 0,
  },

  item: {
    width: '100%',
    minWidth: 0,
  },

  squareItem: {
    height: '50%',
  },

  rectangleItem: {
    height: '100%',
  },

  avatar: {
    margin: 'auto',
    backgroundColor: theme.palette.background.light,
    width: 56,
    height: 56,
    color: theme.palette.info.main,

    '& > svg': {
      width: 30,
      height: 30,
    },
  },

  title: {
    letterSpacing: '-0.025em',
  },

  textWrapper: {
    gap: theme.spacing(0.5),

    '& p': {
      width: '100%',
    },
  },
}));

interface SingleFlowContentProps {
  setting: {
    duration: Duration;
    size: GadgetSize;
    title: string;
    subTitle: string;
    unit?: string;
    icon: JSX.Element;
    colorKey: keyof Palette['gadget'];
  };
  chartsOptions?: {
    labelType?: LineChartsProps['labelType'];
    valueParser?: LineChartsProps['valueParser'];
  };
  start: number;
  curve?: Curve;
  pastCurve?: Curve;
  currentValue?: string | JSX.Element;
  additionalContent?: JSX.Element;
}

const SingleFlowContent: VoidFunctionComponent<SingleFlowContentProps> = ({
  setting: { duration, size, title, subTitle, unit, icon, colorKey },
  chartsOptions,
  currentValue,
  curve,
  pastCurve,
  start,
  additionalContent,
}: SingleFlowContentProps) => {
  const classes = useStyles();
  const theme = useTheme();
  const valueRef = useRef<HTMLDivElement>(null);

  const curves = useMemo(() => (curve ? [curve] : []), [curve]);

  return (
    <Grid
      container
      wrap="nowrap"
      direction={size === GadgetSize.SQUARE ? 'column' : 'row'}
      className={classes.root}
    >
      <Grid
        item
        container
        alignItems="center"
        wrap="nowrap"
        className={clsx(
          classes.item,
          size === GadgetSize.SQUARE ? classes.squareItem : classes.rectangleItem,
        )}
      >
        <Grid item xs={6} container alignItems="center" wrap="nowrap" ref={valueRef}>
          <Grid item xs={4}>
            <Avatar className={classes.avatar}>{icon}</Avatar>
          </Grid>
          <Grid item xs={8}>
            {typeof currentValue === 'string' ? (
              <>
                <ResponsiveTypography
                  variant="h2"
                  component="span"
                  text={currentValue}
                  maxWidth={80}
                  maxFontSize={50}
                  style={{ color: theme.palette.gadget[colorKey] }}
                />
                {unit && (
                  <Typography variant="overline" style={{ color: theme.palette.gadget[colorKey] }}>
                    {unit}
                  </Typography>
                )}
              </>
            ) : (
              currentValue
            )}
          </Grid>
        </Grid>
        <Grid item xs={6} container direction="column" className={classes.textWrapper}>
          <Typography variant="h6" noWrap className={classes.title}>
            {title}
          </Typography>
          <OverflowTooltip title={subTitle}>
            <Typography variant="body2" noWrap>
              {subTitle}
            </Typography>
          </OverflowTooltip>
          {additionalContent}
        </Grid>
      </Grid>
      <Grid
        item
        className={clsx(
          classes.item,
          size === GadgetSize.SQUARE ? classes.squareItem : classes.rectangleItem,
        )}
      >
        <LineCharts
          start={start}
          curves={curves}
          pastCurve={pastCurve}
          duration={duration}
          labelType={chartsOptions?.labelType}
          valueParser={chartsOptions?.valueParser}
        />
      </Grid>
    </Grid>
  );
};

export default SingleFlowContent;
