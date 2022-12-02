import { makeStyles } from '@material-ui/core/styles';
import React, { VoidFunctionComponent, memo } from 'react';
import clsx from 'clsx';

import { LiveViewDevice } from '../../../libs/type';
import { splitModeColumnCount } from '../../../libs/constants';
import { useSurveillanceContext } from '../SurveillanceProvider';

import SingleScreen from './SingleScreen';
import SplitScreenToolbar from './Toolbar';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    height: '100%',
  },

  content: {
    display: 'grid',
    flex: 1,
    alignContent: 'start',
    alignSelf: 'center',
    padding: theme.spacing(1, 2),
    width: '100%',
    maxWidth: 'calc((var(--vh) * 100 - 250px) / 9 * 16)',
  },
}));

interface SplitScreensProps {
  className?: string;
  onFix: (fixItem: { device: LiveViewDevice; fixIdx: number }) => void;
}

const SplitScreens: VoidFunctionComponent<SplitScreensProps> = ({
  className,
  onFix,
}: SplitScreensProps) => {
  const classes = useStyles();
  const { currentPageDevices, splitMode, activeDevice } = useSurveillanceContext();

  const columnCount = splitModeColumnCount[splitMode];
  const gridsPerPage = columnCount ** 2;

  return (
    <div className={clsx(classes.root, className)}>
      <div
        className={classes.content}
        style={{ gridTemplateColumns: `repeat(${columnCount}, 1fr)` }}
      >
        {Array.from({ length: columnCount ** 2 }, (_, i) => {
          const device: LiveViewDevice | undefined = currentPageDevices[i];
          return (
            <SingleScreen
              key={device?.deviceId || i.toString()}
              deviceId={device?.deviceId}
              selectedLabel={(i + 1).toString()}
              isActive={device?.deviceId === activeDevice?.deviceId}
              isFixed={device && device.fixedIndex !== null && device.fixedIndex < gridsPerPage}
              onToggleFix={() => {
                if (device) onFix({ device, fixIdx: i });
              }}
            />
          );
        })}
      </div>
      <SplitScreenToolbar />
    </div>
  );
};

export default memo(SplitScreens);
