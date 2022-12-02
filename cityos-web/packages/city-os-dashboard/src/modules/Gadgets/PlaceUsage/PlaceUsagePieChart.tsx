import { useTheme } from '@material-ui/core/styles';
import React, { VoidFunctionComponent } from 'react';

import Group from '@visx/group/lib/Group';
import ParentSize from '@visx/responsive/lib/components/ParentSize';
import Pie from '@visx/shape/lib/shapes/Pie';

import { PieChart } from '../../../libs/type';

interface PlaceUsagePieChartProps {
  data: PieChart;
}

const PlaceUsagePieChart: VoidFunctionComponent<PlaceUsagePieChartProps> = ({
  data,
}: PlaceUsagePieChartProps) => {
  const theme = useTheme();

  return (
    <ParentSize>
      {({ width, height }) => {
        const innerWidth = Math.max(0, width);
        const innerHeight = Math.max(0, height);
        const radius = Math.min(innerWidth, innerHeight) / 2;
        const centerY = innerHeight / 2;
        const centerX = innerWidth / 2;

        return (
          <svg width={width} height={height}>
            <Group top={centerY} left={centerX}>
              <Pie
                data={data}
                pieValue={(d) => d.value}
                outerRadius={radius}
                innerRadius={radius / 1.6}
                pieSort={null}
              >
                {(pie) =>
                  pie.arcs.map((arc) => {
                    const arcPath = pie.path(arc);
                    const arcFill = arc.data.color || theme.palette.gadget.reserved;

                    return (
                      <g>
                        <path d={arcPath || undefined} fill={arcFill} />
                      </g>
                    );
                  })
                }
              </Pie>
            </Group>
          </svg>
        );
      }}
    </ParentSize>
  );
};

export default PlaceUsagePieChart;
