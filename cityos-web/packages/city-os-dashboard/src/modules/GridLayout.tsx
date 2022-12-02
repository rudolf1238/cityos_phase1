import { Layouts, Responsive as ResponsiveGridLayout } from 'react-grid-layout';
import { makeStyles } from '@material-ui/core/styles';
import React, {
  ForwardRefRenderFunction,
  ForwardedRef,
  VoidFunctionComponent,
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import clsx from 'clsx';

import AddIcon from '@material-ui/icons/Add';
import CloseIcon from '@material-ui/icons/Close';
import DoneIcon from '@material-ui/icons/Done';
import Paper from '@material-ui/core/Paper';
import Slide from '@material-ui/core/Slide';
import Typography from '@material-ui/core/Typography';

import ThemeIconButton from 'city-os-common/modules/ThemeIconButton';

import {
  ConfigFormType,
  GadgetConfig,
  GadgetType,
  GadgetsConfig,
  GridLayoutBreakpoint,
} from '../libs/type';
import { GadgetBaseProps } from './Gadgets/GadgetBase';
import { gadgetWidthPx, gridLayoutColumnSizes, gridLayoutMinWidths } from '../libs/constants';
import {
  isDeviceDurationLayout,
  isDeviceLayout,
  isDeviceOnly,
  isDevicePluralTitle,
  isDeviceTemperatureUnitLayout,
  isDevicesDurationLayout,
  isDevicesTitle,
  isDivisionLayout,
  isDivisionOnly,
} from '../libs/validators';
import useDashboardTranslation from '../hooks/useDashboardTranslation';

import AqiMonitor from './Gadgets/AqiMonitor';
import CarFlow from './Gadgets/CarFlow';
import CarFlows from './Gadgets/CarFlows';
import CarIdentify from './Gadgets/CarIdentify';
import EVAlarmStats from './Gadgets/EVAlarmStats';
import EVChargers from './Gadgets/EVChargers';
import EVStats from './Gadgets/EVStats';
import ExtremeAqiDivision from './Gadgets/ExtremeAqiDivision';
import GenderAgeFlow from './Gadgets/GenderAgeFlow';
import HumanFlow from './Gadgets/HumanFlow';
import HumanFlows from './Gadgets/HumanFlows';
import HumanShape from './Gadgets/HumanShape';
import IndoorAirQuality from './Gadgets/IndoorAirQuality';
import IndoorEnergyConsumption from './Gadgets/IndoorEnergyConsumption';
import IndoorTemperature from './Gadgets/IndoorTemperature';
import LiveView from './Gadgets/LiveView';
import MalfunctionFlow from './Gadgets/MalfunctionFlow';
import PlaceUsage from './Gadgets/PlaceUsage';
import PowerConsumption from './Gadgets/PowerConsumption';
import ProperRate from './Gadgets/ProperRate';
import SetBrightnessPercentOfLamp from './Gadgets/SetBrightnessPercentOfLamp';
import Weather from './Gadgets/Weather';
import WifiFlow from './Gadgets/WifiFlow';

const useStyles = makeStyles((theme) => ({
  backdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: theme.zIndex.drawer + 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width: '100vw',
    height: 'calc(var(--vh) * 100)',
  },

  buttonWrapper: {
    display: 'flex',
    position: 'fixed',
    right: theme.spacing(4.5),
    bottom: theme.spacing(12),
    flexDirection: 'column',
    gap: theme.spacing(2),
    zIndex: theme.zIndex.drawer + 3,
  },

  layoutWrapper: {
    position: 'relative',
    background: 'transparent',
    height: '100%',
    overflowY: 'auto',
  },

  draggableLayoutWrapper: {
    zIndex: theme.zIndex.drawer + 2,

    '&::-webkit-scrollbar': {
      backgroundColor: 'transparent',
    },
  },

  layout: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    margin: 'auto',
  },

  gadget: {
    paddingBottom: theme.spacing(2),

    '&:hover': {
      // let tooltip comes above other gadget
      zIndex: 1,
    },
  },

  xsDoubleWidth: {
    '& > .MuiCard-root': {
      width: '200%',
    },
  },

  draggableGadget: {
    cursor: 'pointer',
  },

  addNewWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 'auto',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.grey[50],
    cursor: 'pointer',
    width: '100%',
    maxWidth: 980,
    height: 450,
  },

  addButton: {
    backgroundColor: theme.palette.grey[100],
  },
}));

interface GadgetContentProps {
  config: GadgetConfig<ConfigFormType>;
  gadgetProps: Pick<
    GadgetBaseProps<ConfigFormType>,
    'isDraggable' | 'enableDuplicate' | 'onDelete' | 'onUpdate' | 'onDuplicate'
  >;
}

const GadgetContent: VoidFunctionComponent<GadgetContentProps> = memo(
  ({ config, gadgetProps }: GadgetContentProps) => {
    switch (config.type) {
      case GadgetType.LIVE_VIEW:
        return isDeviceOnly(config) ? <LiveView {...gadgetProps} config={config} /> : null;
      case GadgetType.CAR_IDENTIFY:
        return isDeviceOnly(config) ? <CarIdentify {...gadgetProps} config={config} /> : null;
      case GadgetType.HUMAN_SHAPE:
        return isDeviceOnly(config) ? <HumanShape {...gadgetProps} config={config} /> : null;
      case GadgetType.AQI_OF_DEVICE:
        return isDeviceOnly(config) ? <AqiMonitor {...gadgetProps} config={config} /> : null;
      case GadgetType.AQI_IN_DIVISION:
        return isDivisionOnly(config) ? (
          <ExtremeAqiDivision {...gadgetProps} config={config} />
        ) : null;
      case GadgetType.EV_CHARGERS:
        return isDivisionLayout(config) ? <EVChargers {...gadgetProps} config={config} /> : null;
      case GadgetType.EV_STATS:
        return isDivisionLayout(config) ? <EVStats {...gadgetProps} config={config} /> : null;
      case GadgetType.HUMAN_FLOW:
        return isDeviceDurationLayout(config) ? (
          <HumanFlow {...gadgetProps} config={config} />
        ) : null;
      case GadgetType.HUMAN_FLOWS:
        return isDevicesDurationLayout(config) ? (
          <HumanFlows {...gadgetProps} config={config} />
        ) : null;
      case GadgetType.CAR_FLOW:
        return isDeviceDurationLayout(config) ? <CarFlow {...gadgetProps} config={config} /> : null;
      case GadgetType.CAR_FLOWS:
        return isDevicesDurationLayout(config) ? (
          <CarFlows {...gadgetProps} config={config} />
        ) : null;
      case GadgetType.WIFI:
        return isDeviceDurationLayout(config) ? (
          <WifiFlow {...gadgetProps} config={config} />
        ) : null;
      case GadgetType.MALFUNCTION_FLOW:
        return isDivisionLayout(config) ? (
          <MalfunctionFlow {...gadgetProps} config={config} />
        ) : null;
      case GadgetType.PROPER_RATE:
        return isDivisionLayout(config) ? <ProperRate {...gadgetProps} config={config} /> : null;
      case GadgetType.EV_ALARM_STATS:
        return isDivisionLayout(config) ? <EVAlarmStats {...gadgetProps} config={config} /> : null;
      case GadgetType.GENDER_AGE_FLOW:
        return isDeviceDurationLayout(config) ? (
          <GenderAgeFlow {...gadgetProps} config={config} />
        ) : null;
      case GadgetType.SET_BRIGHTNESS_PERCENT_OF_LAMP:
        return isDevicePluralTitle(config) ? (
          <SetBrightnessPercentOfLamp {...gadgetProps} config={config} />
        ) : null;
      case GadgetType.INDOOR_AIR_QUALITY:
        return isDeviceDurationLayout(config) ? (
          <IndoorAirQuality {...gadgetProps} config={config} />
        ) : null;
      case GadgetType.INDOOR_TEMPERATURE:
        return isDeviceDurationLayout(config) ? (
          <IndoorTemperature {...gadgetProps} config={config} />
        ) : null;
      case GadgetType.POWER_CONSUMPTION:
        return isDeviceLayout(config) ? (
          <PowerConsumption {...gadgetProps} config={config} />
        ) : null;
      case GadgetType.WEATHER:
        return isDeviceTemperatureUnitLayout(config) ? (
          <Weather {...gadgetProps} config={config} />
        ) : null;
      case GadgetType.PLACE_USAGE:
        return isDevicesTitle(config) ? <PlaceUsage {...gadgetProps} config={config} /> : null;
      case GadgetType.INDOOR_ENERGY_CONSUMPTION:
        return isDeviceOnly(config) ? (
          <IndoorEnergyConsumption {...gadgetProps} config={config} />
        ) : null;
      default:
        return null;
    }
  },
);

const transitionDuration = 500;

interface GridLayoutProps {
  gadgets: GadgetsConfig;
  layouts: Layouts;
  slideDirection: 'left' | 'right';
  isDraggable: boolean;
  enableAdd: boolean;
  onDelete: (deleteKey: string) => void;
  onDragSave: () => void;
  onDragCancel: () => void;
  onLayoutChange: (allLayouts: Layouts) => void;
  onOpenAdd: () => void;
  onUpdateConfig: (newGadgetConfig: GadgetConfig<ConfigFormType>) => void;
  onDuplicateConfig: (newGadgetConfig: GadgetConfig<ConfigFormType>) => void;
}

const GridLayout: ForwardRefRenderFunction<HTMLDivElement, GridLayoutProps> = (
  {
    gadgets,
    layouts,
    slideDirection,
    isDraggable,
    enableAdd,
    onDelete,
    onDragSave,
    onDragCancel,
    onLayoutChange,
    onOpenAdd,
    onUpdateConfig,
    onDuplicateConfig,
  }: GridLayoutProps,
  ref: ForwardedRef<HTMLDivElement>,
) => {
  const classes = useStyles();
  const { t } = useDashboardTranslation(['common', 'dashboard']);
  const [breakpoint, setBreakpoint] = useState<GridLayoutBreakpoint>();
  const [layoutWidth, setLayoutWidth] = useState(0);
  const [layoutWrapperWidth, setLayoutWrapperWidth] = useState(0);
  const layoutWrapperRef = useRef<HTMLDivElement | null>(null);

  const gadgetProps = {
    isDraggable,
    enableDuplicate: enableAdd,
    onDelete,
    onUpdate: onUpdateConfig,
    onDuplicate: onDuplicateConfig,
  };

  const handleLayoutChange = useCallback(
    (_, allLayouts: Layouts) => {
      onLayoutChange(allLayouts);
    },
    [onLayoutChange],
  );

  const resetLayoutWidth = useCallback((wrapperWidth: number) => {
    const acceptableCols = Math.floor(wrapperWidth / gadgetWidthPx);
    const newCols = Math.max(1, Math.min(acceptableCols, 4));
    setLayoutWidth(newCols * gadgetWidthPx);

    const currentBreakpoint = (
      Object.entries(gridLayoutColumnSizes) as [GridLayoutBreakpoint, number][]
    ).find(([_, col]) => col === newCols);
    if (currentBreakpoint) setBreakpoint(currentBreakpoint[0]);
  }, []);

  useEffect(() => {
    if (!ref) return;
    if (typeof ref === 'function') {
      ref(layoutWrapperRef.current);
    } else {
      // eslint-disable-next-line no-param-reassign
      ref.current = layoutWrapperRef.current;
    }
  }, [ref]);

  useEffect(() => {
    if (!layoutWrapperRef.current) {
      return () => {};
    }

    const observer = new ResizeObserver((entries) => {
      const { width } = entries[0].contentRect;
      setLayoutWrapperWidth(width);
      resetLayoutWidth(width);
    });
    observer.observe(layoutWrapperRef.current);

    return () => {
      observer.disconnect();
    };
  }, [resetLayoutWidth]);

  return (
    <>
      {isDraggable && (
        <>
          <div className={classes.backdrop} />
          <div className={classes.buttonWrapper}>
            <ThemeIconButton color="primary" variant="contained" onClick={onDragCancel}>
              <CloseIcon />
            </ThemeIconButton>
            <ThemeIconButton color="primary" variant="contained" onClick={onDragSave}>
              <DoneIcon />
            </ThemeIconButton>
          </div>
        </>
      )}
      <Slide
        direction={slideDirection}
        in
        mountOnEnter
        unmountOnExit
        timeout={{ enter: transitionDuration, exit: transitionDuration }}
      >
        <div
          ref={layoutWrapperRef}
          className={clsx(classes.layoutWrapper, { [classes.draggableLayoutWrapper]: isDraggable })}
        >
          {gadgets.length > 0 && breakpoint ? (
            <ResponsiveGridLayout
              // force update on breakpoint change to avoid wrong width when resizing from small to larger breakpoint
              key={breakpoint}
              margin={[16, 0]}
              autoSize={false}
              rowHeight={gadgetWidthPx / 2}
              width={layoutWidth} // for grid-layout to calculate breakpoints
              style={{
                width: layoutWidth, // for css to apply width
              }}
              className={classes.layout}
              isDraggable={isDraggable}
              layouts={layouts}
              breakpoints={gridLayoutMinWidths}
              cols={gridLayoutColumnSizes}
              onLayoutChange={handleLayoutChange}
            >
              {gadgets.map((config) => (
                <div
                  key={config.id}
                  data-grid={{
                    w: config.width,
                    h: config.height,
                    x: 0,
                    y: 0,
                  }}
                  className={clsx(classes.gadget, {
                    [classes.draggableGadget]: isDraggable,
                    // force rectangle gadget to keep width in xs breakpoint
                    [classes.xsDoubleWidth]:
                      breakpoint === GridLayoutBreakpoint.xs && config.width === 2,
                  })}
                  style={
                    // force rectangle gadget to align to left edge in xs breakpoint
                    breakpoint === GridLayoutBreakpoint.xs && config.width === 2
                      ? {
                          marginLeft: Math.min(gadgetWidthPx - layoutWrapperWidth, 0) / 2,
                        }
                      : undefined
                  }
                >
                  <GadgetContent gadgetProps={gadgetProps} config={config} />
                </div>
              ))}
            </ResponsiveGridLayout>
          ) : (
            <Paper className={classes.addNewWrapper} variant="outlined" onClick={onOpenAdd}>
              <ThemeIconButton variant="contained" className={classes.addButton}>
                <AddIcon />
              </ThemeIconButton>
              <Typography color="primary" variant="h6">
                {t('dashboard:Add a new gadget')}
              </Typography>
            </Paper>
          )}
        </div>
      </Slide>
    </>
  );
};

export default forwardRef<HTMLDivElement, GridLayoutProps>(GridLayout);
