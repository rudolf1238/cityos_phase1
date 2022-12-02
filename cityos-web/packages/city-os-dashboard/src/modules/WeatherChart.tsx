import { makeStyles, useTheme } from '@material-ui/core/styles';
import React, { VoidFunctionComponent, memo, useCallback, useMemo } from 'react';

import SvgIcon from '@material-ui/core/SvgIcon';

import { Group } from '@visx/group';
import { LinePath } from '@visx/shape';
import { MarkerCircle } from '@visx/marker';
import { ParentSize } from '@visx/responsive';
import { TickLabelProps } from '@visx/axis/lib/types';
import { curveNatural } from '@visx/curve';
import { scaleLinear } from '@visx/scale';

import { WeatherCondition, WeatherConditionCode, WeatherConditionTime } from '../libs/type';
import MemoAxisBottom from './visx/MemoAxisBottom';

import { weatherConditionInfo } from './Gadgets/Weather/weatherInfo';

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
}));

export interface WeatherUnit {
  hour?: number;
  temperature?: number;
  humidity?: number;
  windSpeed?: number;
  condition?: WeatherCondition;
}

export interface WeatherChartProps {
  data: WeatherUnit[];
}

const WeatherChart: VoidFunctionComponent<WeatherChartProps> = ({ data }: WeatherChartProps) => {
  const theme = useTheme();
  const classes = useStyles();

  const defaultMargin = {
    top: 0,
    left: 12,
    bottom: 0,
    right: 4,
  };

  const timeTickLabelProps: TickLabelProps<number> = useCallback(
    (_, _index) => ({
      dx: theme.spacing(3),
      textAnchor: 'middle' as const,
      dominantBaseline: 'middle',
      fontSize: 11.5,
      fill: theme.palette.grey[500],
    }),
    [theme],
  );
  const timeTickParser = useCallback(
    (label: number) => {
      if (label === 0 && data[label]?.hour === new Date().getHours()) {
        return 'now';
      }
      if (data[label]?.hour !== undefined) {
        const hour = data[label]?.hour || 0;
        const tag = hour / 12 > 1 ? 'pm' : 'am';
        return `${hour % 12}${tag}`;
      }
      return '';
    },
    [data],
  );

  const temperatureTickLabelProps: TickLabelProps<number> = useCallback(
    (_, _index) => ({
      dx: theme.spacing(3),
      textAnchor: 'middle' as const,
      dominantBaseline: 'middle',
      fontSize: 13,
      fill: theme.palette.type === 'dark' ? theme.palette.primary.main : theme.palette.info.main,
      fontWeight: 'bold',
    }),
    [theme],
  );
  const temperatureTickParser = useCallback(
    (label: number) => {
      if (data[label]?.temperature !== undefined) {
        const value = data[label]?.temperature || 0;
        return `${value}°`;
      }
      return '---°';
    },
    [data],
  );

  const humTickLabelProps: TickLabelProps<number> = useCallback(
    (_, _index) => ({
      dx: theme.spacing(3),
      textAnchor: 'middle' as const,
      dominantBaseline: 'middle',
      fontSize: 13,
      fill: theme.palette.primary.main,
    }),
    [theme],
  );
  const humTickParser = useCallback(
    (label: number) => {
      if (data[label]?.humidity !== undefined) {
        const value = data[label]?.humidity || 0;
        return `${value}%`;
      }
      return '---%';
    },
    [data],
  );

  const windTickLabelProps: TickLabelProps<number> = useCallback(
    (_, _index) => ({
      dx: theme.spacing(3),
      textAnchor: 'middle' as const,
      dominantBaseline: 'middle',
      fontSize: 10,
      fill: theme.palette.type === 'dark' ? theme.palette.primary.main : theme.palette.info.main,
    }),
    [theme],
  );
  const windTickParser = useCallback(
    (label: number) => {
      if (data[label]?.windSpeed !== undefined) {
        const value = data[label]?.windSpeed || 0;
        return `${value}m/s`;
      }
      return '---m/s';
    },
    [data],
  );

  const maxTemperature = Math.max(...data.map((d) => d.temperature || 0));
  const minTemperature = Math.min(...data.map((d) => d.temperature || 0));

  const showLine = useMemo(() => {
    let response = false;
    data.forEach((weather) => {
      if (weather.temperature !== undefined) {
        response = true;
      }
    });

    return response;
  }, [data]);

  return (
    <ParentSize>
      {({ width, height }) => {
        // log.info({ width, height });

        const innerWidth = Math.max(0, width - defaultMargin.left - defaultMargin.right);
        const innerHeight = Math.max(0, height - defaultMargin.top - defaultMargin.bottom);

        if (innerHeight <= 0 || innerWidth <= 0) return null;

        const blockWidth = innerWidth + defaultMargin.left / 2;

        const axisXScale = scaleLinear<number>({
          domain: [0, 6],
          range: [0, innerWidth],
        });

        const axisYScale = scaleLinear<number>({
          domain: [maxTemperature, minTemperature],
          range: [0, 40],
        });

        const linerData = [
          { time: -0.44, value: data[0].temperature },
          { time: 0, value: data[0].temperature },
          { time: 1, value: data[1].temperature },
          { time: 2, value: data[2].temperature },
          { time: 3, value: data[3].temperature },
          { time: 4, value: data[4].temperature },
          { time: 5, value: data[5].temperature },
          { time: 5.5, value: data[5].temperature },
        ];

        return (
          <div className={classes.root}>
            <svg width={width} height={height} className={classes.svg}>
              <Group left={defaultMargin.left} top={defaultMargin.top}>
                <MemoAxisBottom
                  hideTicks
                  scale={axisXScale}
                  strokeWidth={0}
                  tickClassName={classes.bottomTicks}
                  tickLabelProps={timeTickLabelProps}
                  tickFormat={timeTickParser}
                  tickValues={[0, 1, 2, 3, 4, 5]}
                />
                <Group top={30} left={-defaultMargin.left / 2}>
                  {Array.from(Array(6).keys()).map((i: number) => (
                    <rect
                      key={`rect-${i}`}
                      x={((blockWidth - 12) / 6) * i + (i + 1)}
                      width={(blockWidth - 15) / 6}
                      height={80}
                      fill={
                        i === 0 ? theme.palette.action.selected : theme.palette.background.light
                      }
                    />
                  ))}
                </Group>
                <MemoAxisBottom
                  hideTicks
                  top={22.5}
                  scale={axisXScale}
                  strokeWidth={0}
                  tickClassName={classes.bottomTicks}
                  tickLabelProps={temperatureTickLabelProps}
                  tickFormat={temperatureTickParser}
                  tickValues={[0, 1, 2, 3, 4, 5]}
                />
                <MemoAxisBottom
                  hideTicks
                  top={102.5}
                  scale={axisXScale}
                  strokeWidth={0}
                  tickClassName={classes.bottomTicks}
                  tickLabelProps={humTickLabelProps}
                  tickFormat={humTickParser}
                  tickValues={[0, 1, 2, 3, 4, 5]}
                />
                <MemoAxisBottom
                  hideTicks
                  top={125}
                  scale={axisXScale}
                  strokeWidth={0}
                  tickClassName={classes.bottomTicks}
                  tickLabelProps={windTickLabelProps}
                  tickFormat={windTickParser}
                  tickValues={[0, 1, 2, 3, 4, 5]}
                />
                <Group top={77.5}>
                  {Array.from(Array(6).keys()).map((i: number) => (
                    <SvgIcon
                      key={`weather-icon-${i}`}
                      x={14 + i * (blockWidth / 6 - 1)}
                      width="24"
                      height="24"
                      viewBox="0 0 60 60"
                      component={
                        data[i].condition?.icon ||
                        weatherConditionInfo[WeatherConditionCode.UNKNOWN][WeatherConditionTime.DAY]
                          .icon
                      }
                    />
                  ))}
                </Group>
                <MarkerCircle
                  stroke={theme.palette.type === 'dark' ? '#dd5969' : '#fb7181'}
                  id="marker-circle"
                  fill={theme.palette.background.light}
                  size={2}
                  strokeWidth={1}
                  refX={1}
                />
                <Group left={25} top={50}>
                  {showLine && (
                    <LinePath
                      data={linerData}
                      x={(d) => axisXScale(d.time) ?? 0}
                      y={(d) => (d.value !== undefined ? axisYScale(d.value) ?? 0 : 0)}
                      curve={curveNatural}
                      stroke={theme.palette.type === 'dark' ? '#dd5969' : '#fb7181'}
                      strokeWidth={theme.spacing(0.125)}
                      strokeOpacity={1}
                      markerMid="url(#marker-circle)"
                    />
                  )}
                </Group>
              </Group>
            </svg>
          </div>
        );
      }}
    </ParentSize>
  );
};

export default memo(WeatherChart);
