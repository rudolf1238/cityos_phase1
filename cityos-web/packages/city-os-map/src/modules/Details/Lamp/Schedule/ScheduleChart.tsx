import { curveStepAfter } from '@visx/curve';
import { fade, makeStyles, useTheme } from '@material-ui/core/styles';
import { scaleLinear } from '@visx/scale';
import { v4 as uuidv4 } from 'uuid';
import React, {
  MouseEventHandler,
  VoidFunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import clsx from 'clsx';

import { AreaClosed } from '@visx/shape';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { GridRows } from '@visx/grid';
import { Group } from '@visx/group';
import { ParentSize } from '@visx/responsive';

import { LightControl } from 'city-os-common/libs/schema';
import formatDate from 'city-os-common/libs/formatDate';

const useStyles = makeStyles((theme) => ({
  root: {
    overflow: 'visible',
  },

  marker: {
    fill: '#FFF',
    stroke: theme.palette.primary.main,
    r: theme.spacing(0.5),
    strokeWidth: 2,
  },

  markerText: {
    fontSize: theme.typography.caption.fontSize,
    fontWeight: 'normal',
    fill: theme.palette.primary.main,
    dominantBaseline: 'middle',
    textAnchor: 'middle',
  },

  tick: {
    fontSize: theme.typography.caption.fontSize,
    fontWeight: 'normal',
    fill: theme.palette.grey[700],
  },

  lastTick: {
    textAnchor: 'end',
  },

  bottomTicks: {
    transform: `translateX(${theme.spacing(1)}px)`,
    fontWeight: 'normal',
  },
}));

interface ChartPoint {
  time: number;
  brightness: number;
}

const defaultMargin = {
  top: 28,
  left: 32,
  bottom: 28,
  right: 0,
};

const simpleMargin = {
  top: 16,
  left: 0,
  bottom: 32,
  right: 0,
};

const parseTimeToMins = (hour: number, minute: number) => hour * 60 + minute;

const minsInDay = parseTimeToMins(24, 0);
const startTimeInMins = parseTimeToMins(13, 0);
const defaultTickValues = [startTimeInMins, 11 * 60 + startTimeInMins];

// parse time to mins and adjust by start time since axis need to be linear value
const parseToTimeAxis = (control: LightControl) => {
  const timeInMins = parseTimeToMins(control.hour, control.minute);
  return timeInMins < startTimeInMins ? timeInMins + minsInDay : timeInMins;
};

// link ended data to start data manually
const getE2eData = (chartData: ChartPoint[]) => {
  if (chartData.length > 0) {
    const lastBrightness = chartData[chartData.length - 1].brightness;
    const newList = [
      { time: startTimeInMins, brightness: lastBrightness },
      ...chartData,
      { time: startTimeInMins + minsInDay, brightness: lastBrightness },
    ];
    return newList;
  }
  return chartData;
};

const getSeparatedData = (chartData: ChartPoint[]) => {
  const linkedData = getE2eData(chartData);
  return linkedData.reduce<{ key: string; data: [ChartPoint, ChartPoint] }[]>((acc, curr, idx) => {
    if (idx <= linkedData.length - 2) {
      acc.push({ key: uuidv4(), data: [curr, linkedData[idx + 1]] });
    }
    return acc;
  }, []);
};

// parse controlList to visx data and sort by mins
const getChartData = (controlList: LightControl[]): ChartPoint[] => {
  const chartData = controlList.map((control) => ({
    time: parseToTimeAxis(control),
    brightness: control.brightness,
  }));
  chartData.sort((a, b) => a.time - b.time);
  return chartData;
};

const timeTickParser = (chartTime: number): string =>
  formatDate({ hours: 0, minutes: chartTime }, 'HH:mm');

interface ChartMarkersProps {
  editable: boolean;
  control: LightControl;
  x: number;
  y: number;
  selectedPoint?: LightControl | null;
  onClick: MouseEventHandler<SVGGElement> | undefined;
}

const PointMarker: VoidFunctionComponent<ChartMarkersProps> = ({
  editable,
  control,
  x,
  y,
  selectedPoint,
  onClick,
}: ChartMarkersProps) => {
  const theme = useTheme();
  const classes = useStyles();

  const tickStyle = useMemo(
    () => ({
      width: theme.spacing(5),
      height: theme.spacing(2),
      strokeWidth: 2,
      offset: theme.spacing(0.5),
    }),
    [theme],
  );

  const timeAxis = useMemo(() => parseToTimeAxis(control), [control]);

  return (
    <g cursor={editable ? 'pointer' : 'default'} onClick={editable ? onClick : undefined}>
      <circle cx={x} cy={y} className={classes.marker} />
      <rect
        rx={theme.spacing(0.5)}
        x={x + tickStyle.offset}
        y={y - tickStyle.offset - tickStyle.height - tickStyle.strokeWidth / 2}
        stroke={
          selectedPoint?.hour === control.hour && selectedPoint?.minute === control.minute
            ? theme.palette.primary.main
            : 'transparent'
        }
        fill={
          selectedPoint?.hour === control.hour && selectedPoint?.minute === control.minute
            ? theme.palette.action.selected
            : 'transparent'
        }
        strokeWidth={tickStyle.strokeWidth}
        width={tickStyle.width}
        height={tickStyle.height}
      />
      <text
        x={x + tickStyle.offset + tickStyle.width / 2}
        y={y - tickStyle.offset - tickStyle.height / 2}
        className={classes.markerText}
      >
        {timeTickParser(timeAxis)}
      </text>
    </g>
  );
};

interface ScheduleChartProps {
  controlList: LightControl[];
  variant?: 'default' | 'simple';
  editable?: boolean;
  selectedPoint?: LightControl | null;
  onSelect?: (selectedData: LightControl) => void;
}

const ScheduleChart: VoidFunctionComponent<ScheduleChartProps> = ({
  controlList,
  variant = 'default',
  editable = true,
  selectedPoint: initialSelectedPoint = null,
  onSelect,
}: ScheduleChartProps) => {
  const theme = useTheme();
  const classes = useStyles();
  const [selectedPoint, setSelectedPoint] = useState<LightControl | null>(initialSelectedPoint);

  const chartData = useMemo(() => getChartData(controlList), [controlList]);
  const margin = useMemo(() => (variant === 'default' ? defaultMargin : simpleMargin), [variant]);

  const timeTickLabelProps = useCallback(
    () => ({
      textAnchor: 'middle' as const,
      dominantBaseline: 'middle',
      fontSize: theme.typography.caption.fontSize,
      fill: theme.palette.text.primary,
    }),
    [theme],
  );

  const brightnessTickLabelProps = useCallback(
    () => ({
      dx: theme.spacing(-0.5),
      dy: theme.spacing(0.5),
      fontSize: theme.typography.caption.fontSize,
      textAnchor: 'end' as const,
      fill: theme.palette.text.secondary,
    }),
    [theme],
  );

  const handleOnClick = useCallback(
    (control) => {
      setSelectedPoint(control);
      if (onSelect) {
        onSelect(control);
      }
    },
    [onSelect],
  );

  const separatedData = useMemo(() => getSeparatedData(chartData), [chartData]);

  useEffect(() => {
    setSelectedPoint(initialSelectedPoint);
  }, [initialSelectedPoint]);

  return (
    <ParentSize>
      {({ width, height }) => {
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;
        const timeScale = scaleLinear<number>({
          range: [0, innerWidth],
          domain: [startTimeInMins, startTimeInMins + minsInDay],
        });
        const brightnessScale = scaleLinear<number>({
          range: [innerHeight, 0],
          domain: [0, 100],
        });

        return (
          <svg width={width} height={height} className={classes.root}>
            <Group left={margin.left} top={margin.top}>
              {variant === 'default' && (
                <GridRows
                  scale={brightnessScale}
                  width={innerWidth}
                  numTicks={5}
                  stroke={theme.palette.grey[300]}
                />
              )}
              {separatedData.map(({ key, data }) => (
                <AreaClosed
                  key={key}
                  data={data}
                  x={(d) => timeScale(d.time)}
                  y={(d) => brightnessScale(d.brightness)}
                  yScale={brightnessScale}
                  curve={curveStepAfter}
                  strokeWidth={0}
                  fill={fade(theme.palette.secondary.main, data[0].brightness / 100)}
                />
              ))}
              {variant === 'simple' && (
                // display first and last time if variant is simple
                <g>
                  <text x={0} y={innerHeight + theme.spacing(2.5)} className={classes.tick}>
                    {timeTickParser(chartData[0]?.time)}
                  </text>
                  <text
                    x={innerWidth}
                    y={innerHeight + theme.spacing(2.5)}
                    className={clsx(classes.tick, classes.lastTick)}
                  >
                    {timeTickParser(chartData[chartData.length - 1]?.time)}
                  </text>
                </g>
              )}
              <AxisBottom
                hideTicks
                top={innerHeight}
                scale={timeScale}
                tickFormat={(t) => timeTickParser(t as number)}
                tickValues={variant === 'default' ? defaultTickValues : []}
                stroke={theme.palette.primary.main}
                strokeWidth={5}
                tickLabelProps={timeTickLabelProps}
                tickClassName={classes.bottomTicks}
              />
              {variant === 'default' && (
                <AxisLeft
                  hideTicks
                  hideAxisLine
                  scale={brightnessScale}
                  numTicks={5}
                  tickLabelProps={brightnessTickLabelProps}
                />
              )}
              {variant === 'default' &&
                controlList.map((control) => (
                  <PointMarker
                    key={`${control.hour}-${control.minute}`}
                    editable={editable}
                    control={control}
                    selectedPoint={selectedPoint}
                    x={timeScale(parseToTimeAxis(control))}
                    y={brightnessScale(control.brightness)}
                    onClick={() => handleOnClick(control)}
                  />
                ))}
            </Group>
          </svg>
        );
      }}
    </ParentSize>
  );
};

export default ScheduleChart;
