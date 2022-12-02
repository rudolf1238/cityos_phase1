import { Palette } from '@material-ui/core/styles/createPalette';
import { TooltipWithBounds, useTooltip } from '@visx/tooltip';
import { curveLinear } from '@visx/curve';
import { fade, makeStyles, useTheme } from '@material-ui/core/styles';
import { localPoint } from '@visx/event';
import { scaleLinear } from '@visx/scale';
import React, {
  MouseEvent,
  VoidFunctionComponent,
  memo,
  useCallback,
  useEffect,
  useMemo,
} from 'react';

import { AreaClosed, Bar, Line, LinePath } from '@visx/shape';
import { AxisBottom, AxisRight, TickFormatter } from '@visx/axis';
import { Grid } from '@visx/grid';
import { Group } from '@visx/group';
import { LinearGradient } from '@visx/gradient';
import { ParentSize } from '@visx/responsive';
import Typography from '@material-ui/core/Typography';

import { Point } from 'city-os-common/libs/schema';
import { isNumber } from 'city-os-common/libs/validators';
import { msOfDay, msOfHour } from 'city-os-common/libs/constants';
import { roundDownDate, roundUpDate } from 'city-os-common/libs/roundDate';
import formatDate from 'city-os-common/libs/formatDate';
import getClosestPoint from 'city-os-common/libs/getClosestPoint';

import useEventsTranslation from '../../../hooks/useEventsTranslation';

const useStyles = makeStyles((theme) => ({
  root: {
    position: 'relative',
  },

  svg: {
    overflow: 'visible',
  },

  bottomTicks: {
    fontWeight: 'normal',
  },

  tooltip: {
    display: 'flex',
    gap: theme.spacing(1.5),
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(1.5, 2),
    color: theme.palette.primary.contrastText,
    ...theme.overrides?.MuiTooltip?.tooltip,

    '& > span:last-of-type': {
      marginLeft: 'auto',
    },
  },

  tooltipContent: {
    textTransform: 'none',
  },
}));

const numTicksRows = 4;
const desiredTickCount = 15;

const getTicks = (length: number, callback: (i: number) => number) =>
  Array.from({ length }, (_, i) => callback(i));

type NumberValue = number | { valueOf(): number };

type TooltipData = Point;

export interface EventLineChartProps {
  points: Point[];
  start: number;
  end: number;
  maxY: number /** need to be multiples of four  */;
  color: keyof Palette['events'];
  interval: 'day' | 'hour';
  onTooltipChange: (newTooltipData: TooltipData) => void;
}

const EventLineChart: VoidFunctionComponent<EventLineChartProps> = ({
  points,
  start,
  end,
  maxY,
  color,
  interval,
  onTooltipChange,
}: EventLineChartProps) => {
  const theme = useTheme();
  const classes = useStyles();
  const { t } = useEventsTranslation(['common', 'variables']);

  const { showTooltip, updateTooltip, tooltipData } = useTooltip<TooltipData>();

  const axisStart = roundDownDate(start, interval).getTime();
  const axisEnd = roundUpDate(end, interval).getTime();

  const filteredPoints = useMemo(
    () => points.filter((point) => point.time >= axisStart && point.time <= axisEnd),
    [axisEnd, points, axisStart],
  );

  const horizontalAxisTickValues = useMemo(() => {
    const step = interval === 'hour' ? msOfHour : msOfDay;
    const ticks: number[] = [roundDownDate(axisStart, interval).getTime()];

    while (ticks[ticks.length - 1] + step <= axisEnd) {
      ticks.push(ticks[ticks.length - 1] + step);
    }

    const tickStep = Math.ceil(ticks.length / desiredTickCount);
    return ticks.filter((_, idx) => idx % tickStep === 0);
  }, [axisEnd, interval, axisStart]);

  const timeTickFormatter: TickFormatter<NumberValue> = useCallback(
    (time: NumberValue, idx: number) => {
      const tickValue = new Date(isNumber(time) ? time : time.valueOf());
      const lastTickValue = new Date(horizontalAxisTickValues[idx - 1]);
      let format = t(
        interval === 'hour'
          ? 'variables:dateFormat.common.hourMinute'
          : 'variables:dateFormat.common.monthDay',
      );

      if (interval === 'hour' && tickValue.toDateString() !== lastTickValue.toDateString()) {
        format = `${format},${t('variables:dateFormat.common.monthDay')}`;
      }

      return formatDate(tickValue, format);
    },
    [horizontalAxisTickValues, interval, t],
  );

  const timeTooltipParser = useCallback(
    (time: number) =>
      formatDate(
        new Date(time),
        interval === 'hour'
          ? t('variables:dateFormat.events.tooltipHour')
          : t('variables:dateFormat.common.monthDay'),
      ),
    [interval, t],
  );

  const timeTickLabelProps = useMemo(
    () => ({
      dx: theme.spacing(-0.5),
      textAnchor: 'start' as const,
      dominantBaseline: 'start',
      fontSize: theme.typography.caption.fontSize,
      fill: fade(theme.palette.text.primary, 0.5),
    }),
    [theme],
  );

  const secondaryTimeTickLabelProps = useMemo(
    () => ({
      ...timeTickLabelProps,
      fill: theme.palette.text.primary,
    }),
    [theme.palette.text.primary, timeTickLabelProps],
  );

  const valueTickLabelProps = useCallback(
    () => ({
      dx: theme.spacing(2.5),
      dy: theme.spacing(0.5),
      textAnchor: 'end' as const,
      fontSize: theme.typography.caption.fontSize,
      fill: fade(theme.palette.text.primary, 0.5),
    }),
    [theme],
  );

  const margin = {
    top: 28,
    left: 16,
    bottom: 28,
    right: 12 + maxY.toLocaleString('en-US').length * 5,
  };

  useEffect(() => {
    updateTooltip({
      tooltipOpen: true,
      tooltipData: undefined,
    });
  }, [filteredPoints, updateTooltip]);

  useEffect(() => {
    if (!tooltipData && filteredPoints.length) {
      showTooltip({
        tooltipData: filteredPoints[filteredPoints.length - 1],
      });
    }
  }, [filteredPoints, tooltipData, showTooltip]);

  useEffect(() => {
    if (tooltipData) onTooltipChange(tooltipData);
  }, [tooltipData, onTooltipChange]);

  return (
    <ParentSize>
      {({ width, height }) => {
        const innerWidth = Math.max(0, width - margin.left - margin.right);
        const innerHeight = Math.max(0, height - margin.top - margin.bottom);

        const timeScale = scaleLinear<number>({
          range: [0, innerWidth],
          domain: [axisStart, axisEnd],
        });
        const valueScale = scaleLinear<number>({
          range: [innerHeight, 0],
          domain: [0, maxY],
        });

        const handleTooltip = (event: MouseEvent<SVGRectElement>) => {
          const { x } = localPoint(event) || { x: 0 };
          const currentTime: number =
            ((x - margin.left) / innerWidth) * (axisEnd - axisStart) + axisStart;
          const closestPoint = getClosestPoint({
            points: filteredPoints,
            currentTime,
          });
          if (closestPoint) {
            showTooltip({
              tooltipData: closestPoint,
            });
          }
        };

        return (
          <div className={classes.root}>
            <svg width={width} height={height} className={classes.svg}>
              <Group left={margin.left} top={margin.top}>
                <Grid
                  xScale={timeScale}
                  yScale={valueScale}
                  width={innerWidth}
                  height={innerHeight}
                  rowTickValues={getTicks(numTicksRows + 1, (i) => (maxY / numTicksRows) * i)}
                  columnLineStyle={{ strokeWidth: 0 }}
                  rowLineStyle={{
                    stroke: theme.palette.gadget.contrastText,
                    strokeOpacity: 0.15,
                  }}
                />
                <LinePath
                  data={filteredPoints}
                  x={(d) => timeScale(d.time)}
                  y={(d) => valueScale(d.value)}
                  curve={curveLinear}
                  stroke={theme.palette.events[color]}
                  strokeWidth={1}
                  strokeOpacity={1}
                />
                <LinearGradient
                  id={`area-background-${color}`}
                  from={theme.palette.events[color]}
                  to={fade(theme.palette.events[color], 0.28)}
                />
                <AreaClosed
                  data={filteredPoints}
                  x={(d) => timeScale(d.time)}
                  y={(d) => valueScale(d.value)}
                  yScale={valueScale}
                  curve={curveLinear}
                  fill={`url(#area-background-${color})`}
                  strokeWidth={0}
                />
                <AxisBottom
                  hideTicks
                  top={innerHeight}
                  scale={timeScale}
                  tickFormat={timeTickFormatter}
                  tickValues={horizontalAxisTickValues}
                  strokeWidth={0}
                  tickComponent={({ formattedValue, x, y }) =>
                    formattedValue?.split(',').map((v, idx) => (
                      <text
                        key={idx.toString()}
                        x={x}
                        y={y + theme.spacing(2 * idx)}
                        {...(idx === 0 ? timeTickLabelProps : secondaryTimeTickLabelProps)}
                      >
                        {v}
                      </text>
                    ))
                  }
                  tickClassName={classes.bottomTicks}
                />
                <AxisRight
                  hideTicks
                  hideAxisLine
                  scale={valueScale}
                  tickValues={getTicks(numTicksRows + 1, (i) => (maxY / numTicksRows) * i)}
                  tickFormat={(value) => value.toString()}
                  tickLabelProps={valueTickLabelProps}
                  left={innerWidth}
                />
                {tooltipData?.time !== undefined && tooltipData?.value !== undefined && (
                  <>
                    <Line
                      from={{
                        x: timeScale(tooltipData.time),
                        y: 0,
                      }}
                      to={{
                        x: timeScale(tooltipData.time),
                        y: innerHeight,
                      }}
                      stroke={theme.palette.info.main}
                      strokeWidth={1}
                      pointerEvents="none"
                    />
                    <circle
                      cx={timeScale(tooltipData.time)}
                      cy={valueScale(tooltipData?.value)}
                      r={4}
                      fill="white"
                      stroke={theme.palette.events[color]}
                      strokeOpacity={1}
                      strokeWidth={2}
                      pointerEvents="none"
                    />
                  </>
                )}
                {points.length === 1 && (
                  <circle
                    cx={timeScale(points[0].time)}
                    cy={valueScale(points[0].value)}
                    r={4}
                    fill="white"
                    stroke={theme.palette.events[color]}
                    strokeOpacity={1}
                    strokeWidth={2}
                    pointerEvents="none"
                  />
                )}
                <Bar
                  width={innerWidth}
                  height={innerHeight}
                  fill="transparent"
                  rx={14}
                  onClick={handleTooltip}
                />
              </Group>
            </svg>
            {tooltipData?.time !== undefined && tooltipData?.value !== undefined && (
              <TooltipWithBounds
                top={valueScale(tooltipData.value) + margin.top}
                left={timeScale(tooltipData.time) + margin.left}
                className={classes.tooltip}
                applyPositionStyle
                unstyled
              >
                <Typography variant="overline">{timeTooltipParser(tooltipData.time)}</Typography>
                <Typography variant="overline" className={classes.tooltipContent}>
                  {tooltipData.value}
                </Typography>
              </TooltipWithBounds>
            )}
          </div>
        );
      }}
    </ParentSize>
  );
};

export default memo(EventLineChart);
