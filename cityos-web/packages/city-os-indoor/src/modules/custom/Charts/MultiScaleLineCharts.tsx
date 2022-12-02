import { makeStyles, useTheme } from '@material-ui/core/styles';
import React, {
  MouseEvent,
  TouchEvent,
  VoidFunctionComponent,
  memo,
  useCallback,
  useMemo,
} from 'react';
import _ from 'lodash';

import Typography from '@material-ui/core/Typography';

import { Bar, LinePath } from '@visx/shape';
import { Group } from '@visx/group';
import { ParentSize } from '@visx/responsive';
import { TickLabelProps } from '@visx/axis';
import { TooltipWithBounds, useTooltip } from '@visx/tooltip';
import { curveLinear } from '@visx/curve';
import { localPoint } from '@visx/event';
import { scaleLinear } from '@visx/scale';

import formatDate from 'city-os-common/libs/formatDate';

import MemoAxisBottom from './visx/MemoAxisBottom';
import MemoAxisLeft from './visx/MemoAxisLeft';
import MemoAxisRight from './visx/MemoAxisRight';

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
    backgroundColor: theme.palette.background.tooltip,
    padding: theme.spacing(1.5, 2),
  },

  tooltipItem: {
    display: 'flex',
    gap: theme.spacing(1.5),
    alignItems: 'center',
    color: theme.palette.primary.contrastText,

    // 取消強制置右，除非哪天客戶突然不想要時間顯示在頂部 by Fishcan @ 2022.07.20
    // '& > span:last-of-type': {
    //   marginLeft: 'auto',
    // },
  },

  tooltipContent: {
    textTransform: 'none',
  },

  squareIcon: {
    width: 8,
    height: 8,
  },
}));

export interface Color {
  name?: string;
  value: string;
}

export const color: Color[] = [
  {
    name: 'red',
    value: '#f44336',
  },
  {
    name: 'pink',
    value: '#e91e63',
  },
  {
    name: 'purple',
    value: '#9c27b0',
  },
  {
    name: 'deepPurple',
    value: '#673ab7',
  },
  {
    name: 'indigo',
    value: '#3f51b5',
  },
  {
    name: 'blue',
    value: '#2196f3',
  },
  {
    name: 'lightBlue',
    value: '#03a9f4',
  },
  {
    name: 'cyan',
    value: '#00bcd4',
  },
  {
    name: 'teal',
    value: '#009688',
  },
  {
    name: 'green',
    value: '#4caf50',
  },
  {
    name: 'lightGreen',
    value: '#8bc34a',
  },
  {
    name: 'lime',
    value: '#cddc39',
  },
  {
    name: 'yellow',
    value: '#ffeb3b',
  },
  {
    name: 'amber',
    value: '#ffc107',
  },
  {
    name: 'orange',
    value: '#ff9800',
  },
  {
    name: 'deepOrange',
    value: '#ff5722',
  },
];

export interface Point {
  time: number;
  value: number;
}

export interface Line {
  id: string;
  color: Color;
  pointList: Point[];
  unit?: string;
}

interface PointWithColor extends Omit<Line, 'id' | 'pointList' | 'color'> {
  point: Point;
  color?: Color;
}

interface ClosestPointData {
  key: string;
  label: string;
  color?: Color;
}

type TooltipData = ClosestPointData[];

export interface MultiScaleLineChartsProps {
  lineList: Line[];
  startTime: number;
  endTime: number;
}

const MultiScaleLineCharts: VoidFunctionComponent<MultiScaleLineChartsProps> = ({
  lineList,
  startTime,
  endTime,
}: MultiScaleLineChartsProps) => {
  const theme = useTheme();
  const classes = useStyles();

  const {
    showTooltip,
    hideTooltip,
    tooltipData,
    tooltipTop = 0,
    tooltipLeft = 0,
  } = useTooltip<TooltipData>();

  const defaultMargin = {
    top: 24,
    left: 10,
    bottom: 24,
    right: 10,
  };

  const defaultValueRange = {
    min: 0,
    max: 0,
  };

  // 本來作為統一縱軸的，但是因為客戶想要的是多緯度的圖，
  // 假如客戶會回心轉意能拿回來用
  // Fishcan @ 2022.07.04

  // const maxValue: number = useMemo(
  //   () =>
  //     lineList.reduce(
  //       (reduceValue, line) =>
  //         _.max([
  //           reduceValue,
  //           ...line.pointList.map((point) => point.value || defaultValueRange.max),
  //         ]) || defaultValueRange.max,
  //       0,
  //     ),
  //   [defaultValueRange.max, lineList],
  // );

  // const minValue: number = useMemo(
  //   () =>
  //     lineList.reduce(
  //       (reduceValue, line) =>
  //         _.min([
  //           reduceValue,
  //           ...line.pointList.map((point) => point.value || defaultValueRange.min),
  //         ]) || defaultValueRange.min,
  //       0,
  //     ),
  //   [defaultValueRange.min, lineList],
  // );

  const getTicks = (hopeLength: number, callback: (i: number) => number, maxLength = 25) => {
    const length = Math.min(hopeLength, maxLength);
    return Array.from({ length }, (num, i) => callback(i));
  };

  // 有瑕疵的計算方式，先用簡易的方式
  // const getTickValue = (min: number, max: number, length: number) => {
  //   const minCount = Math.floor(Math.abs(min)).toString().length;
  //   const maxCount = Math.floor(Math.abs(max)).toString().length;

  //   const tickMinValue = Math.ceil(min / 10 ** (minCount - 1)) * 10 ** (minCount - 1);
  //   const tickMaxValue = Math.ceil(max / 10 ** (maxCount - 1)) * 10 ** (maxCount - 1);

  //   const gap = (tickMaxValue - tickMinValue) / length;
  //   const gapCount = Math.floor(Math.abs(gap)).toString().length;

  //   const tickGap = Math.round(gap / 10 ** (gapCount - 1)) * 10 ** (gapCount - 1);

  //   const tickLength = Math.floor((tickMaxValue - tickMinValue) / tickGap) || 1;

  //   const tmp = getTicks(tickLength, (i) => i);

  //   const resultValueList = [...tmp].map((value, index) => tickMinValue + tickGap * index);

  //   return resultValueList.filter((value) => value >= min && value <= max);
  // };

  const getTickValue = (min: number, max: number, length: number) => {
    const range = max - min;
    const tickGap = Math.floor(range / length);
    const tickLength = Math.floor(range / tickGap) || 1;
    const tmp = getTicks(tickLength, (i) => i);
    const resultValueList = [...tmp].map((value, index) => min + tickGap * index);
    resultValueList.push(max);
    resultValueList.push(min);
    const res = resultValueList.filter(
      (value, index) =>
        value >= min && value <= max && value !== resultValueList[Math.max(index - 1, 0)],
    );
    return res;
  };

  const valueTickParser = useCallback((value: number) => value.toString(), []);

  const valueTickLabelProps = useCallback(
    (
      fill: string = theme.palette.grey[300],
      dx = -0.2,
      fontSize: string | number | undefined = theme.typography.caption.fontSize,
    ) => ({
      dx: theme.spacing(dx),
      // dy: theme.spacing(0.5), // 偏移 Y 軸的參數
      textAnchor: 'end' as const,
      fontSize,
      fill,
    }),
    [theme],
  );

  // 不要先做排序，因為真實的資料不會是排序過的
  // const currentLineList = useMemo(
  //   () => lineList.sort((a, b) => b.pointList.length - a.pointList.length),
  //   [lineList],
  // );

  const currentLineList = useMemo(() => lineList, [lineList]);

  const timeTickParser = useCallback((time: number) => formatDate(time, 'yyyy-MM-dd HH:mm:ss'), []);

  const timeTickLabelProps: TickLabelProps<number> = useCallback(
    () => ({
      textAnchor: 'middle' as const,
      dominantBaseline: 'middle',
      fontSize: theme.typography.caption.fontSize,
      fill: theme.palette.grey[500],
    }),
    [theme],
  );

  const getNearPoint = useCallback((line: Line, time: number): PointWithColor => {
    const minList = line.pointList.filter((point) => point.time <= time);
    const index = minList.length;

    return {
      color: line.color,
      point: line.pointList[index],
      unit: line.unit,
    };
  }, []);

  return (
    <ParentSize>
      {({ width, height }) => {
        const innerWidth = Math.max(0, width - defaultMargin.left - defaultMargin.right);
        const innerHeight = Math.max(0, height - defaultMargin.top - defaultMargin.bottom);

        const axisWidth = 40;
        const timeScaleMinRange = axisWidth + defaultMargin.left;
        const timeScaleMaxRange = innerWidth - Math.max(lineList.length - 1, 0) * axisWidth - 10;

        const timeScale = scaleLinear<number>({
          range: [timeScaleMinRange, timeScaleMaxRange],
          domain: [startTime, endTime],
        });

        const axisBottomTickCount = Math.floor(innerWidth / 200);

        const handleTooltip = (event: TouchEvent<SVGRectElement> | MouseEvent<SVGRectElement>) => {
          const { x, y } = localPoint(event) || { x: 0, y: 0 };

          const currentTime: number =
            ((x - 62) / (timeScaleMaxRange - timeScaleMinRange)) * (endTime - startTime) +
            startTime;

          const targetPointList: PointWithColor[] = lineList
            .map((line) => getNearPoint(line, currentTime))
            .filter((nearPoint) => nearPoint.point !== undefined);

          const currentTooltipData = targetPointList.map(
            ({ point, color: iColor, unit }: PointWithColor) => ({
              key: `${point.time}-${point.value}-${iColor?.name || ''}-${new Date().getTime()}`,
              label:
                point.value !== undefined ? `${Math.round(point.value)} ${unit || ''}` : 'No data',
              color: iColor,
            }),
          );

          currentTooltipData.splice(0, 0, {
            key: 'time',
            label: formatDate(currentTime, 'yyyy-MM-dd HH:mm:ss'),
            color: undefined,
          });

          showTooltip({
            tooltipData: currentTooltipData,
            tooltipLeft: x - defaultMargin.left,
            tooltipTop: y - defaultMargin.top,
          });
        };

        return (
          <div className={classes.root}>
            <svg width={width} height={height} className={classes.svg}>
              <Group left={defaultMargin.left} top={defaultMargin.top}>
                {currentLineList.map((line: Line, index: number) => {
                  const minY =
                    _.min(line.pointList.map((point) => point.value || defaultValueRange.min)) ||
                    defaultValueRange.min;
                  const maxY =
                    _.max(line.pointList.map((point) => point.value || defaultValueRange.max)) ||
                    defaultValueRange.min;

                  const valueScale = scaleLinear<number>({
                    range: [innerHeight, 0],
                    domain: [minY, maxY],
                  });

                  const numTicksRows = Math.ceil(innerHeight / 25);

                  const verticalTicks = getTickValue(minY, maxY, numTicksRows);

                  const charts =
                    line.pointList.length === 1 ? (
                      <circle
                        r={theme.spacing(0.375)}
                        cx={timeScale(line.pointList[0].time)}
                        cy={valueScale(line.pointList[0].value)}
                        stroke={line.color.value}
                        fill="transparent"
                        strokeOpacity={1}
                        strokeWidth={theme.spacing(0.3125)}
                        pointerEvents="none"
                      />
                    ) : (
                      <LinePath
                        data={line.pointList}
                        x={(d) => timeScale(d.time) ?? 0}
                        y={(d) => valueScale(d.value) ?? 0}
                        curve={curveLinear}
                        stroke={line.color.value}
                        strokeWidth={theme.spacing(0.25)}
                        strokeOpacity={1}
                      />
                    );

                  const axis =
                    line.pointList.length !== 1 &&
                    (index === 0 ? (
                      <MemoAxisLeft
                        left={defaultMargin.left + 30 * (index + 1)}
                        hideTicks
                        scale={valueScale}
                        tickValues={verticalTicks}
                        tickFormat={valueTickParser}
                        tickLabelProps={() => valueTickLabelProps(line.color.value)}
                        stroke={line.color.value}
                      />
                    ) : (
                      <MemoAxisRight
                        left={innerWidth - 40 * index + 5}
                        scale={valueScale}
                        tickValues={verticalTicks}
                        tickFormat={valueTickParser}
                        tickLabelProps={(x: number) =>
                          valueTickLabelProps(
                            line.color.value,
                            1.7,
                            `${Math.min((0.75 / x.toString().length) * 2, 0.75)}rem`,
                          )
                        }
                        stroke={line.color.value}
                      />
                    ));

                  return (
                    <>
                      {axis}
                      {charts}
                    </>
                  );
                })}
                <MemoAxisBottom
                  hideTicks
                  top={innerHeight - 3}
                  scale={timeScale}
                  tickFormat={timeTickParser}
                  tickValues={getTicks(
                    axisBottomTickCount,
                    (i) => startTime + (i * (endTime - startTime)) / (axisBottomTickCount - 1),
                  )}
                  strokeWidth={0}
                  tickLabelProps={timeTickLabelProps}
                  tickClassName={classes.bottomTicks}
                />
                <Group left={timeScaleMinRange}>
                  <Bar
                    width={timeScaleMaxRange - timeScaleMinRange}
                    height={innerHeight + 3}
                    fill="transparent"
                    // rx={14}
                    onTouchStart={handleTooltip}
                    onTouchMove={handleTooltip}
                    onMouseMove={handleTooltip}
                    onMouseLeave={hideTooltip}
                  />
                </Group>
              </Group>
            </svg>
            {tooltipData && (
              <TooltipWithBounds
                top={tooltipTop + defaultMargin.top}
                left={tooltipLeft + defaultMargin.left}
                className={classes.tooltip}
                applyPositionStyle
                unstyled
              >
                {tooltipData.map(({ key, label, color: iColor }, _idx) => (
                  <div key={key} className={classes.tooltipItem}>
                    {iColor && (
                      <div
                        className={classes.squareIcon}
                        style={{
                          backgroundColor: iColor?.value,
                        }}
                      />
                    )}
                    <Typography variant="overline" className={classes.tooltipContent} align="left">
                      {label}
                    </Typography>
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

export default memo(MultiScaleLineCharts);
