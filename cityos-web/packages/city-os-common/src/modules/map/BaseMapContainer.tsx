import 'leaflet/dist/leaflet.css';
import { LatLng } from 'leaflet';
import { MapContainer, MapContainerProps, TileLayer } from 'react-leaflet';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import React, {
  FunctionComponent,
  PropsWithChildren,
  ReactNode,
  memo,
  useCallback,
  useState,
} from 'react';
import clsx from 'clsx';

import useCommonTranslation from '../../hooks/useCommonTranslation';

import DrawController from './DrawController';
import DrawLayer from './DrawLayer';

const useStyles = makeStyles((theme) => ({
  root: {
    position: 'relative',
  },

  map: {
    width: '100%',
    height: '100%',
    backgroundColor: theme.palette.background.default,
  },

  darkLoaded: {
    '& .leaflet-tile-loaded': {
      /* stylelint-disable-next-line declaration-colon-space-after */
      filter:
        'brightness(0.6) invert(1) contrast(3) hue-rotate(200deg) saturate(0) brightness(0.7)',
    },
  },

  disableClick: {
    '& .leaflet-marker-icon': {
      pointerEvents: 'none !important',
    },
  },

  disableGrab: {
    '& .leaflet-grab': {
      cursor: 'pointer !important',
    },
  },
}));

interface BaseMapContainerProps extends MapContainerProps {
  disableDraw?: boolean;
  disableClick?: boolean;
  className?: string;
  onDrawingStart?: () => void;
  onDrawingDone?: () => void;
  onDelete?: () => void;
  onSelectionDone?: (polygonPositions: LatLng[]) => void;
  children: ReactNode;
  disableTile?: boolean;
}

const BaseMapContainer: FunctionComponent<BaseMapContainerProps> = ({
  disableDraw = false,
  disableClick = false,
  className,
  onDrawingStart,
  onDrawingDone,
  onDelete,
  onSelectionDone,
  children,
  disableTile = false,
  ...props
}: PropsWithChildren<BaseMapContainerProps>) => {
  const classes = useStyles();
  const theme = useTheme();
  const { t, i18n } = useCommonTranslation('variables');

  const [stage, setStage] = useState<'default' | 'drawing' | 'done'>('default');
  const [polygonPositions, setPolygonPositions] = useState<LatLng[]>([]);

  const handleSelectionDone = useCallback(() => {
    if (onSelectionDone) onSelectionDone(polygonPositions);
  }, [onSelectionDone, polygonPositions]);

  return (
    <div
      className={clsx(
        classes.root,
        {
          [classes.disableGrab]: stage !== 'default',
          [classes.disableClick]: disableClick,
        },
        className,
      )}
    >
      <MapContainer
        // force rerender if theme or language change
        key={`${theme.palette.type}${i18n.language || ''}`}
        zoom={13}
        zoomControl={false}
        className={clsx(classes.map, { [classes.darkLoaded]: theme.palette.type === 'dark' })}
        {...props}
      >
        {disableDraw || (
          <DrawLayer
            stage={stage}
            polygonPositions={polygonPositions}
            setStage={setStage}
            setPolygonPositions={setPolygonPositions}
          />
        )}
        {disableTile || (
          <TileLayer
            attribution={
              // eslint-disable-next-line i18next/no-literal-string
              '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
            }
            url={(i18n.language && t('mapURL')) || ''}
          />
        )}
        {children}
      </MapContainer>
      {disableDraw || (
        <DrawController
          stage={stage}
          setStage={setStage}
          setPolygonPositions={setPolygonPositions}
          onDrawingStart={onDrawingStart}
          onDrawingDone={onDrawingDone}
          onSelectionDone={handleSelectionDone}
          onDelete={onDelete}
        />
      )}
    </div>
  );
};

export default memo(BaseMapContainer);
