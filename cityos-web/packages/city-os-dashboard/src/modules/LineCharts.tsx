import { Palette } from '@material-ui/core/styles/createPalette';
import { ScaleTypeToD3Scale, scaleLinear } from '@visx/scale';
import { TooltipWithBounds, useTooltip } from '@visx/tooltip';
import { curveLinear } from '@visx/curve';
import { fade, makeStyles, useTheme } from '@material-ui/core/styles';
import { localPoint } from '@visx/event';
import React, {
  Fragment,
  MouseEvent,
  TouchEvent,
  VoidFunctionComponent,
  memo,
  useCallback,
  useMemo,
} from 'react';

import { AreaClosed, Bar, Line, LinePath } from '@visx/shape';
import { Group } from '@visx/group';
import { LinearGradient } from '@visx/gradient';
import { ParentSize } from '@visx/responsive';
import { TickLabelProps } from '@visx/axis';
import Typography from '@material-ui/core/Typography';

import { Point } from 'city-os-common/libs/schema';
import { msOfDay, msOfHour, msOfWeek } from 'city-os-common/libs/constants';
import formatDate from 'city-os-common/libs/formatDate';
import getClosestPoint from 'city-os-common/libs/getClosestPoint';

import { Curve, Duration } from '../libs/type';
import { defaultColors } from '../libs/constants';
import useDashboardTranslation from '../hooks/useDashboardTranslation';

import MemoAxisBottom from './visx/MemoAxisBottom';
import MemoAxisLeft from './visx/MemoAxisLeft';
import MemoGrid from './visx/MemoGrid';

const defaultMaxAxisYValue = 40;

const useStyles = makeStyles((theme) => ({
  root: {
    position: 'relative',
  },

  svg: {
    overflow: 'visible',
  },

  bottomTicks: {
    transform: `translateX(${theme.spacing(0.5)}px)`,
    fontWeight: 'normal',
  },

  tooltip: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(1.5, 2),
    ...theme.overrides?.MuiTooltip?.tooltip,
  },

  tooltipItem: {
    display: 'flex',
    gap: theme.spacing(1.5),
    alignItems: 'center',
    color: theme.palette.primary.contrastText,

    '& > span:last-of-type': {
      marginLeft: 'auto',
    },
  },

  tooltipContent: {
    textTransform: 'none',
  },

  squareIcon: {
    width: 8,
    height: 8,
  },
}));

interface LineChartProps {
  timeScale: ScaleTypeToD3Scale<number, number, never>['linear'];
  valueScale: ScaleTypeToD3Scale<number, number, never>['linear'];
  points: Point[];
  variant?: Curve['variant'] | 'pastCurve';
  color?: keyof Palette['gadget'];
}

const LineChart: VoidFunctionComponent<LineChartProps> = memo(
  ({
    timeScale,
    valueScale,
    points,
    variant = 'curve',
    color = 'notInService',
  }: LineChartProps) => {
    const theme = useTheme();

    return (
      <>
        {variant === 'pastCurve' && (
          <LinePath
            data={points}
            x={(d) => timeScale(d.time)}
            y={(d) => valueScale(d.value)}
            curve={curveLinear}
            stroke={fade(theme.palette.gadget.contrastText, 0.5)}
            strokeWidth={1}
            strokeOpacity={1}
            strokeDasharray={3}
          />
        )}
        {(variant === 'curve' || variant === 'areaClosed') && (
          <LinePath
            data={points}
            x={(d) => timeScale(d.time)}
            y={(d) => valueScale(d.value)}
            curve={curveLinear}
            stroke={theme.palette.gadget[color]}
            strokeWidth={1}
            strokeOpacity={1}
          />
        )}
        {variant === 'areaClosed' && (
          <>
            <LinearGradient
              id={`area-background-${color}`}
              from={theme.palette.gadget[color]}
              to={fade(theme.palette.gadget[color], 0.28)}
            />
            <AreaClosed
              data={points}
              x={(d) => timeScale(d.time)}
              y={(d) => valueScale(d.value)}
              yScale={valueScale}
              curve={curveLinear}
              fill={`url(#area-background-${color})`}
              strokeWidth={0}
            />
          </>
        )}
      </>
    );
  },
);

const numTicksRows = 4;

const getTicks = (length: number, callback: (i: number) => number) =>
  Array.from({ length }, (_, i) => callback(i));

interface ClosestPointData extends Omit<Curve, 'points' | 'variant'> {
  point: Point | undefined;
  isPastCurve?: boolean;
}

type TooltipData = ClosestPointData[];

interface TooltipCurve extends Curve {
  isPastCurve?: boolean;
}

const getTooltipData = ({
  curves,
  currentTime,
}: {
  curves: TooltipCurve[];
  currentTime: number;
}): TooltipData =>
  curves.map(({ key, label, color, points, isPastCurve }) => {
    const closestPoint = getClosestPoint({ points, currentTime });
    return {
      key: `${isPastCurve ? 'past' : ''}${key}${closestPoint?.time.toString() || ''}`,
      label,
      color,
      point: closestPoint,
      isPastCurve,
    };
  });

export interface LineChartsProps {
  curves: Curve[];
  start?: number;
  pastCurve?: Curve;
  duration?: Duration;
  labelType?: 'default' | 'time' | 'none';
  valueParser?: (value: number) => number | string;
}

const LineCharts: VoidFunctionComponent<LineChartsProps> = ({
  curves,
  start,
  pastCurve,
  duration = Duration.DAY,
  labelType = 'default',
  valueParser,
}: LineChartsProps) => {
  const theme = useTheme();
  const classes = useStyles();
  const { t } = useDashboardTranslation(['common', 'variables']);

  const {
    showTooltip,
    hideTooltip,
    tooltipData,
    tooltipTop = 0,
    tooltipLeft = 0,
  } = useTooltip<TooltipData>();

  const startTime = start || curves?.[0]?.points?.[0]?.time || 0;

  const durationConfig: {
    timeScaleRange: number;
    timeOfDuration: number;
    timeInStep: number;
    columnTicks: number[];
    bottomTicks: number[];
  } = useMemo(() => {
    switch (duration) {
      case Duration.WEEK:
        return {
          timeScaleRange: msOfDay * 6,
          timeOfDuration: msOfWeek,
          timeInStep: msOfDay,
          columnTicks: getTicks(8, (i) => startTime + i * msOfDay),
          bottomTicks: getTicks(7, (i) => startTime + i * msOfDay),
        };
      default:
        return {
          timeScaleRange: msOfDay,
          timeOfDuration: msOfDay,
          timeInStep: msOfHour,
          columnTicks: getTicks(25, (i) => startTime + i * msOfHour),
          bottomTicks: getTicks(9, (i) => startTime + i * msOfHour * 3),
        };
    }
  }, [duration, startTime]);

  const timeTickParser = useCallback(
    (time: number) =>
      formatDate(
        time,
        duration === Duration.DAY
          ? 'HH:mm'
          : `${t('variables:dateFormat.dashboard.gadget.lineChart')}`,
      ),
    [duration, t],
  );

  const valueTickParser = useCallback((value: number) => value.toString(), []);

  const timeTickLabelProps: TickLabelProps<number> = useCallback(
    (_, index) => ({
      textAnchor: 'middle' as const,
      dominantBaseline: 'middle',
      fontSize: theme.typography.caption.fontSize,
      fill: theme.palette.grey[durationConfig.bottomTicks.length - 1 === index ? 500 : 300],
    }),
    [theme, durationConfig],
  );

  const valueTickLabelProps = useCallback(
    () => ({
      dx: theme.spacing(-0.2),
      dy: theme.spacing(0.5),
      textAnchor: 'end' as const,
      fontSize: theme.typography.caption.fontSize,
      fill: theme.palette.grey[300],
    }),
    [theme],
  );

  const filteredCurves: Curve[] = useMemo(
    () =>
      curves?.length > 0
        ? curves.map((curve) => {
            const newCurve: Curve = { ...curve };
            newCurve.points = newCurve.points.filter(
              (point) =>
                point.time >= startTime && point.time <= startTime + durationConfig.timeScaleRange,
            );
            return newCurve;
          })
        : curves,
    [curves, durationConfig.timeScaleRange, startTime],
  );

  const maxY = useMemo(() => {
    let maxValue = 0;
    filteredCurves.forEach(({ points }) => {
      points.forEach(({ value }) => {
        if (value > maxValue) {
          maxValue = value;
        }
      });
    });
    if (pastCurve) {
      pastCurve.points.forEach(({ value }) => {
        if (value > maxValue) {
          maxValue = value;
        }
      });
    }
    const step =
      maxValue <= 100
        ? Math.ceil(maxValue / numTicksRows)
        : Math.ceil(maxValue / numTicksRows / 10) * 10;
    return step * numTicksRows || defaultMaxAxisYValue;
  }, [filteredCurves, pastCurve]);

  // in order to put past curve on same axis, recalculate past curve point to current time
  const normalizePastCurve = useMemo(() => {
    if (!pastCurve || pastCurve.points.length === 0) return null;
    const normalizePoints = pastCurve?.points
      .map((point) => ({
        ...point,
        time: point.time + durationConfig.timeScaleRange,
      }))
      .filter(
        (point) =>
          point.time >= startTime && point.time <= startTime + durationConfig.timeScaleRange,
      );
    if (!normalizePoints?.[0]) return null;
    return {
      ...pastCurve,
      points: normalizePoints,
    };
  }, [durationConfig.timeScaleRange, pastCurve, startTime]);

  const rowTickValues = useMemo(
    () => getTicks(numTicksRows + 1, (i) => (maxY / numTicksRows) * i),
    [maxY],
  );

  const verticalTicks = useMemo(
    () => getTicks(numTicksRows / 2 + 1, (i) => (maxY / (numTicksRows / 2)) * i),
    [maxY],
  );

  const gridStyle = useMemo(
    () => ({
      columnLineStyle: { strokeWidth: 0 },
      rowLineStyle: {
        stroke: theme.palette.gadget.contrastText,
        strokeOpacity: 0.15,
      },
    }),
    [theme.palette.gadget.contrastText],
  );

  const margin = {
    top: 28,
    left: 16 + maxY.toLocaleString('en-US').length * 5,
    bottom: 28,
    right: 12,
  };

  return (
    <ParentSize>
      {({ width, height }) => {
        const innerWidth = Math.max(0, width - margin.left - margin.right);
        const innerHeight = Math.max(0, height - margin.top - margin.bottom);

        const timeScale = scaleLinear<number>({
          range: [0, innerWidth],
          domain: [startTime, startTime + durationConfig.timeScaleRange],
        });
        const valueScale = scaleLinear<number>({
          range: [innerHeight, 0],
          domain: [0, maxY],
        });

        const handleTooltip = (event: TouchEvent<SVGRectElement> | MouseEvent<SVGRectElement>) => {
          const { x, y } = localPoint(event) || { x: 0, y: 0 };
          const currentTime: number =
            ((x - margin.left) / innerWidth) * durationConfig.timeScaleRange + startTime;
          const combinedCurves = normalizePastCurve
            ? [{ ...normalizePastCurve, isPastCurve: true }, ...filteredCurves]
            : filteredCurves;

          showTooltip({
            tooltipData: getTooltipData({
              curves: combinedCurves,
              currentTime,
            }),
            tooltipLeft: x - margin.left,
            tooltipTop: y - margin.top,
          });
        };

        return (
          <div className={classes.root}>
            <svg width={width} height={height} className={classes.svg}>
              <Group left={margin.left} top={margin.top}>
                <MemoGrid
                  xScale={timeScale}
                  yScale={valueScale}
                  width={innerWidth}
                  height={innerHeight}
                  columnTickValues={durationConfig.columnTicks}
                  rowTickValues={rowTickValues}
                  columnLineStyle={gridStyle.columnLineStyle}
                  rowLineStyle={gridStyle.rowLineStyle}
                />
                {normalizePastCurve && (
                  <LineChart
                    variant="pastCurve"
                    timeScale={timeScale}
                    valueScale={valueScale}
                    points={normalizePastCurve.points}
                  />
                )}
                {normalizePastCurve?.points.length === 1 && (
                  <circle
                    cx={timeScale(normalizePastCurve.points[0].time)}
                    cy={valueScale(normalizePastCurve.points[0].value)}
                    r={4}
                    fill="white"
                    stroke={theme.palette.info.main}
                    strokeOpacity={1}
                    strokeWidth={2}
                    pointerEvents="none"
                  />
                )}
                {filteredCurves.map(({ key, variant, points, color }, idx) => (
                  <Fragment key={key}>
                    <LineChart
                      timeScale={timeScale}
                      valueScale={valueScale}
                      variant={variant}
                      points={points}
                      color={color || defaultColors[idx]}
                    />
                    {points.length === 1 && (
                      <circle
                        cx={timeScale(points[0].time)}
                        cy={valueScale(points[0].value)}
                        r={4}
                        fill="white"
                        stroke={theme.palette.gadget[color || defaultColors[idx]]}
                        strokeOpacity={1}
                        strokeWidth={2}
                        pointerEvents="none"
                      />
                    )}
                  </Fragment>
                ))}
                <MemoAxisBottom
                  hideTicks
                  top={innerHeight}
                  scale={timeScale}
                  tickFormat={timeTickParser}
                  tickValues={durationConfig.bottomTicks}
                  strokeWidth={0}
                  tickLabelProps={timeTickLabelProps}
                  tickClassName={classes.bottomTicks}
                />
                <MemoAxisLeft
                  hideTicks
                  hideAxisLine
                  scale={valueScale}
                  tickValues={verticalTicks}
                  tickFormat={valueTickParser}
                  tickLabelProps={valueTickLabelProps}
                />
                {tooltipData && (
                  <Line
                    from={{ x: tooltipLeft, y: 0 }}
                    to={{ x: tooltipLeft, y: innerHeight }}
                    stroke={theme.palette.info.main}
                    strokeWidth={1}
                    pointerEvents="none"
                  />
                )}
                {tooltipData?.map(({ key, point, color, isPastCurve }, idx) =>
                  point ? (
                    <circle
                      key={key}
                      cx={timeScale(point.time)}
                      cy={valueScale(point.value)}
                      r={4}
                      fill="white"
                      stroke={
                        isPastCurve
                          ? theme.palette.info.main
                          : theme.palette.gadget[color || defaultColors[idx]]
                      }
                      strokeOpacity={1}
                      strokeWidth={2}
                      pointerEvents="none"
                    />
                  ) : null,
                )}
                <Bar
                  width={innerWidth}
                  height={innerHeight}
                  fill="transparent"
                  rx={14}
                  onTouchStart={handleTooltip}
                  onTouchMove={handleTooltip}
                  onMouseMove={handleTooltip}
                  onMouseLeave={hideTooltip}
                />
              </Group>
            </svg>
            {tooltipData && (
              <TooltipWithBounds
                top={tooltipTop + margin.top}
                left={tooltipLeft + margin.left}
                className={classes.tooltip}
                applyPositionStyle
                unstyled
              >
                {tooltipData.map(({ key, label, color, point, isPastCurve }, idx) => (
                  <div key={key} className={classes.tooltipItem}>
                    <div
                      className={classes.squareIcon}
                      style={{
                        backgroundColor: isPastCurve
                          ? theme.palette.info.main
                          : theme.palette.gadget[color || defaultColors[idx]],
                      }}
                    />
                    {labelType !== 'none' && (
                      <Typography variant="overline">
                        {labelType === 'time' && point
                          ? timeTickParser(
                              isPastCurve ? point.time - durationConfig.timeScaleRange : point.time,
                            )
                          : label}
                      </Typography>
                    )}
                    {point ? (
                      <Typography variant="overline">
                        {valueParser ? valueParser(point.value) : point.value}
                      </Typography>
                    ) : (
                      <Typography variant="overline" className={classes.tooltipContent}>
                        {t('common:No Data')}
                      </Typography>
                    )}
                  </div>
                ))}
              </TooltipWithBounds>
            )}
          </div>
        );
      }}
    </ParentSize>
  );
};

export default memo(LineCharts);
