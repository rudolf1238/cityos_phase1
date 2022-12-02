import { makeStyles, useTheme } from '@material-ui/core/styles';
import React, { MouseEvent, TouchEvent, VoidFunctionComponent, memo, useCallback } from 'react';

import Typography from '@material-ui/core/Typography';

import { Bar } from '@visx/shape';
import { Group } from '@visx/group';
import { ParentSize } from '@visx/responsive';
import { TickLabelProps } from '@visx/axis/lib/types';
import { TooltipWithBounds, useTooltip } from '@visx/tooltip';
import { localPoint } from '@visx/event';
import { scaleLinear } from '@visx/scale';

import MemoAxisBottom from './visx/MemoAxisBottom';
import MemoAxisLeft from './visx/MemoAxisLeft';
import MemoHeatmapRect from './visx/MemoHeatmapRect';

const dayList = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

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
    color: theme.palette.grey[300],
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

    '& > span:last-of-type': {
      marginLeft: 'auto',
    },
  },

  tooltipContent: {
    textTransform: 'none',
  },
}));

export type HeatMapBin = {
  bin: number;
  count: number | undefined;
};

export type HeatMapBins = {
  bin: number;
  bins: HeatMapBin[];
};

interface ClosestPointData extends Omit<HeatMapBin, 'bin'> {
  key: string;
  label: string;
}

type TooltipData = ClosestPointData[];

interface HeatMapChartProps {
  startDate: Date;
  binData: HeatMapBins[];
}

const HeatMapChart: VoidFunctionComponent<HeatMapChartProps> = ({
  startDate,
  binData,
}: HeatMapChartProps) => {
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
    top: 0,
    left: 4,
    bottom: 0,
    right: 4,
  };

  const heatMapStyle = {
    gap: 0.2,
    bin: {
      width: 13.5,
      height: 13.5,
    },
  };

  const axisLeftStyle = {
    width: 32,
    offset: {
      x: 4,
      y: 1.25,
    },
  };

  const axisBottomStyle = {
    margin: {
      left: 2,
    },
  };

  const colorScale = (count: number | { valueOf(): number }): string | undefined => {
    if (count > 600) return theme.palette.heatmap.color[600];
    if (count > 500) return theme.palette.heatmap.color[500];
    if (count > 400) return theme.palette.heatmap.color[400];
    if (count > 300) return theme.palette.heatmap.color[300];
    if (count > 0) return theme.palette.heatmap.color[0];
    return 'rgba(0, 0, 0, 0)';
  };

  const timeTickLabelProps: TickLabelProps<number> = useCallback(
    (_) => ({
      textAnchor: 'middle' as const,
      dominantBaseline: 'middle',
      fontSize: 10,
      fill: theme.palette.grey[300],
    }),
    [theme.palette.grey],
  );

  const valueTickLabelProps = useCallback(
    () => ({
      dx: theme.spacing(axisLeftStyle.offset.x),
      dy: theme.spacing(axisLeftStyle.offset.y),
      textAnchor: 'end' as const,
      fontSize: 10,
      fill: theme.palette.grey[300],
    }),
    [axisLeftStyle.offset.x, axisLeftStyle.offset.y, theme],
  );

  const getLabel = useCallback(
    (i: number) => {
      const date = new Date(startDate.getTime() + i * 86400000);
      return `${date.getDate()}/${dayList[date.getDay()]}`;
    },
    [startDate],
  );

  return (
    <ParentSize>
      {({ width, height }) => {
        const heatmapWidth = Math.max(
          0,
          width - defaultMargin.left - defaultMargin.right - axisLeftStyle.width,
        );
        const heatmapHeight =
          ((heatmapWidth - heatMapStyle.gap * 23) / 24) * 7 + heatMapStyle.gap * 6;

        const axisXScale = scaleLinear<number>({
          domain: [0, 24],
          range: [0, heatmapWidth],
        });

        const axisYScale = scaleLinear<number>({
          domain: [0, 7],
          range: [0, heatmapHeight],
        });

        const axisLeftScale = scaleLinear<number>({
          domain: [0, 7],
          range: [0, heatmapHeight + heatMapStyle.gap * 6],
        });

        const handleTooltip = (event: TouchEvent<SVGRectElement> | MouseEvent<SVGRectElement>) => {
          const { x, y } = localPoint(event) || { x: 0, y: 0 };

          const binX = Math.floor(
            ((x - defaultMargin.left - axisLeftStyle.width) / heatmapWidth) * 24,
          );
          const binY = Math.floor(((y - defaultMargin.top) / heatmapHeight) * 7);

          const value = binData[binX].bins[binY].count;

          showTooltip({
            tooltipData: [
              {
                key: `${binX}-${binY}`,
                count: value || 0,
                label: value !== undefined ? `${Math.round(value)} kW` : 'No data',
              },
            ],
            tooltipLeft: x - defaultMargin.left,
            tooltipTop: y - defaultMargin.top,
          });
        };

        return (
          <div className={classes.root}>
            <svg width={width} height={height} className={classes.svg}>
              <Group left={defaultMargin.left} top={defaultMargin.top}>
                <MemoAxisLeft
                  hideTicks
                  hideAxisLine
                  scale={axisLeftScale}
                  tickValues={[0, 1, 2, 3, 4, 5, 6]}
                  tickFormat={(label: number) => getLabel(label)}
                  tickLabelProps={valueTickLabelProps}
                />
              </Group>
              <Group left={defaultMargin.left + axisLeftStyle.width} top={defaultMargin.top}>
                <MemoHeatmapRect
                  data={binData}
                  xScale={(d) => axisXScale(d) ?? 0}
                  yScale={(d) => axisYScale(d) ?? 0}
                  binWidth={heatMapStyle.bin.width}
                  binHeight={heatMapStyle.bin.height}
                  gap={heatMapStyle.gap}
                  colorScale={colorScale}
                >
                  {(heatmap) =>
                    heatmap.map((heatmapBins) =>
                      heatmapBins.map((bin) => (
                        <rect
                          key={`heatmap-rect-${bin.row}-${bin.column}`}
                          width={bin.width}
                          height={bin.height}
                          x={bin.x}
                          y={bin.y}
                          fill={bin.color}
                          fillOpacity={bin.opacity}
                        />
                      )),
                    )
                  }
                </MemoHeatmapRect>
                <MemoAxisBottom
                  hideTicks
                  top={heatmapHeight - 4}
                  left={axisBottomStyle.margin.left}
                  scale={axisXScale}
                  strokeWidth={0}
                  tickClassName={classes.bottomTicks}
                  tickLabelProps={timeTickLabelProps}
                  tickFormat={(label: string) => label}
                  tickValues={[
                    '00',
                    '01',
                    '02',
                    '03',
                    '04',
                    '05',
                    '06',
                    '07',
                    '08',
                    '09',
                    '10',
                    '11',
                    '12',
                    '13',
                    '14',
                    '15',
                    '16',
                    '17',
                    '18',
                    '19',
                    '20',
                    '21',
                    '22',
                    '23',
                  ]}
                />
                <Bar
                  width={heatmapWidth}
                  height={heatmapHeight}
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
                top={tooltipTop + defaultMargin.top}
                left={tooltipLeft + defaultMargin.left}
                className={classes.tooltip}
                applyPositionStyle
                unstyled
              >
                {tooltipData.map(({ key, label }, _idx) => (
                  <div key={key} className={classes.tooltipItem}>
                    <Typography variant="overline" className={classes.tooltipContent}>
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

export default memo(HeatMapChart);
