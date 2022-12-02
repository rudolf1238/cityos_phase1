import { makeStyles, useTheme } from '@material-ui/core/styles';
import React, { VoidFunctionComponent, useMemo, useRef, useState } from 'react';

import Group from '@visx/group/lib/Group';
import ParentSize from '@visx/responsive/lib/components/ParentSize';
import Pie from '@visx/shape/lib/shapes/Pie';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';

import { PieChart, PieChartPoint } from '../libs/type';

const useStyles = makeStyles((theme) => ({
  labels: {
    display: 'flex',
    gap: theme.spacing(1),
    alignItems: 'center',
    padding: theme.spacing(1),
    maxWidth: 150,
  },

  bullet: {
    minWidth: 10,
    height: 10,
  },

  label: {
    textOverflow: 'ellipsis',
  },
}));

interface GadgetPieChartProps {
  data: PieChart;
}

const GadgetPieChart: VoidFunctionComponent<GadgetPieChartProps> = ({
  data,
}: GadgetPieChartProps) => {
  const theme = useTheme();
  const classes = useStyles();

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState<PieChartPoint | null>(null);

  const total = useMemo(() => data.reduce<number>((acc, curr) => curr.value + acc, 0), [data]);

  return (
    <ParentSize>
      {({ width, height }) => {
        const innerWidth = Math.max(0, width);
        const innerHeight = Math.max(0, height);
        const radius = Math.min(innerWidth, innerHeight) / 2;
        const centerY = innerHeight / 2;
        const centerX = innerWidth / 2;

        return (
          <div ref={containerRef}>
            <svg width={width} height={height}>
              <Group top={centerY} left={centerX}>
                <Pie data={data} pieValue={(d) => d.value} outerRadius={radius} pieSort={null}>
                  {(pie) =>
                    pie.arcs.map((arc) => {
                      const arcPath = pie.path(arc);
                      const arcFill = arc.data.color || theme.palette.gadget.reserved;

                      return (
                        <Tooltip
                          key={arc.data.key}
                          title={
                            <div className={classes.labels}>
                              <div
                                className={classes.bullet}
                                style={{ backgroundColor: arc.data.color }}
                              />
                              <Typography variant="overline" className={classes.label} noWrap>
                                {arc.data.key.toUpperCase()}
                              </Typography>
                              <Typography variant="overline" className={classes.label}>
                                {`${Math.round((arc.data.value / total) * 100)}%`}
                              </Typography>
                            </div>
                          }
                          open={active?.key === arc.data.key}
                          placement="right"
                          PopperProps={{
                            ref: containerRef,
                          }}
                        >
                          <g
                            onMouseEnter={() => setActive(arc.data)}
                            onMouseLeave={() => setActive(null)}
                          >
                            <path d={arcPath || undefined} fill={arcFill} />
                          </g>
                        </Tooltip>
                      );
                    })
                  }
                </Pie>
              </Group>
            </svg>
          </div>
        );
      }}
    </ParentSize>
  );
};

export default GadgetPieChart;
