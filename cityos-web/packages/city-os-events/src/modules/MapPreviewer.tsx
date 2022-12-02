import { LatLngExpression, Map as LeafletMapClass, icon, point } from 'leaflet';
import { fade, makeStyles, useTheme } from '@material-ui/core/styles';
import { useQuery } from '@apollo/client';
import React, { VoidFunctionComponent, memo, useCallback, useMemo, useState } from 'react';

import { Marker } from 'react-leaflet';
import Backdrop from '@material-ui/core/Backdrop';
import CloseIcon from '@material-ui/icons/Close';
import Typography from '@material-ui/core/Typography';

import { defaultBounds } from 'city-os-common/libs/parsedENV';

import BaseDialog from 'city-os-common/modules/BaseDialog';
import BaseMapContainer from 'city-os-common/modules/map/BaseMapContainer';
import ThemeIconButton from 'city-os-common/modules/ThemeIconButton';

import {
  GET_DEVICES_ON_EVENTS,
  GetDevicesOnEventsPayload,
  GetDevicesOnEventsResponse,
} from '../api/getDevicesOnEvents';
import useEventsTranslation from '../hooks/useEventsTranslation';

import NoLocationDarkImg from '../assets/img/no-location-dark.svg';
import NoLocationLightImg from '../assets/img/no-location-light.svg';

const minZoom = 4;

const useStyles = makeStyles((theme) => ({
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
  },

  previewer: {
    width: 'min(100vw, calc(var(--vh) * 100 / 9 * 16))',
    height: 'min(100vw / 16 * 9, calc(var(--vh) * 100))',
  },

  dialog: {
    padding: 0,
    width: 'min(748px, 100vw)',
  },

  dialogTitle: {
    padding: 0,
  },

  imgWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.palette.background.oddRow,
    padding: theme.spacing(5, 0, 2.5),
  },

  textWrapper: {
    flex: 1,
    borderRadius: `0 0 ${theme.shape.borderRadius}px ${theme.shape.borderRadius}px`,
    backgroundColor: theme.palette.primary.contrastText,
    padding: theme.spacing(3),
    color: fade(theme.palette.background.dark, 0.7),
  },

  close: {
    position: 'absolute',
    top: theme.spacing(3),
    right: theme.spacing(3),
    zIndex: theme.zIndex.speedDial,
  },
}));

const defaultZoom = 17;

interface MapPreviewerProps {
  deviceId: string;
  onClose: () => void;
}

const MapPreviewer: VoidFunctionComponent<MapPreviewerProps> = ({
  deviceId,
  onClose,
}: MapPreviewerProps) => {
  const classes = useStyles();
  const theme = useTheme();
  const { t } = useEventsTranslation('events');
  const [location, setLocation] = useState<LatLngExpression | null>(null);

  useQuery<GetDevicesOnEventsResponse, GetDevicesOnEventsPayload>(GET_DEVICES_ON_EVENTS, {
    variables: {
      deviceIds: deviceId ? [deviceId] : [],
    },
    onCompleted: ({ getDevices }) => {
      const newLocation = getDevices?.[0].location;
      if (newLocation) {
        setLocation(newLocation);
      }
    },
  });

  const onCreated = useCallback(
    async (map: LeafletMapClass) => {
      if (!location) return;
      map.setView(location, defaultZoom);
    },
    [location],
  );

  const markerIcon = useMemo(() => {
    const cameraSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="80px" height="80px" viewBox="-20 -20 80 80">
      <circle fill="${theme.palette.primary.main}" fill-opacity="0.5" cx="20" cy="20" r="40"/>
      <circle fill="${theme.palette.primary.main}" cx="20" cy="20" r="20"/>
      <path
        d="M23.0625 27.75H11.375C11.0103 27.75 10.6606 27.6051 10.4027 27.3473C10.1449 27.0894 10 26.7397 10 26.375V15.375C10 15.0103 10.1449 14.6606 10.4027 14.4027C10.6606 14.1449 11.0103 14 11.375 14H23.0625C23.4272 14 23.7769 14.1449 24.0348 14.4027C24.2926 14.6606 24.4375 15.0103 24.4375 15.375V18.1663L28.1637 15.5056C28.2664 15.4326 28.3871 15.3891 28.5127 15.38C28.6383 15.3708 28.7641 15.3964 28.8761 15.4539C28.9882 15.5113 29.0824 15.5985 29.1483 15.7058C29.2142 15.8132 29.2494 15.9365 29.25 16.0625V25.6875C29.2494 25.8135 29.2142 25.9368 29.1483 26.0442C29.0824 26.1515 28.9882 26.2387 28.8761 26.2961C28.7641 26.3536 28.6383 26.3792 28.5127 26.37C28.3871 26.3609 28.2664 26.3174 28.1637 26.2444L24.4375 23.5838V26.375C24.4375 26.7397 24.2926 27.0894 24.0348 27.3473C23.7769 27.6051 23.4272 27.75 23.0625 27.75Z"
        fill="white"
      />
    </svg>`;

    return icon({
      iconAnchor: point(40, 40),
      iconUrl: `data:image/svg+xml;utf-8, ${window.encodeURIComponent(cameraSvg)}`,
    });
  }, [theme.palette.primary.main]);

  return (
    <Backdrop open className={classes.backdrop}>
      {location ? (
        <>
          <BaseMapContainer
            minZoom={minZoom}
            bounds={defaultBounds}
            zoom={defaultZoom}
            whenCreated={onCreated}
            disableDraw
            className={classes.previewer}
          >
            <Marker icon={markerIcon} position={location} interactive={false} />
          </BaseMapContainer>
          <ThemeIconButton
            size="small"
            color="primary"
            variant="miner"
            className={classes.close}
            onClick={onClose}
          >
            <CloseIcon />
          </ThemeIconButton>
        </>
      ) : (
        <BaseDialog
          open
          onClose={onClose}
          classes={{
            dialog: classes.dialog,
            title: classes.dialogTitle,
          }}
          title=""
          content={
            <>
              <div className={classes.imgWrapper}>
                {theme.palette.type === 'light' ? <NoLocationLightImg /> : <NoLocationDarkImg />}
              </div>
              <div className={classes.textWrapper}>
                <Typography variant="h6" align="center">
                  {t('Location could not be found_')}
                </Typography>
              </div>
            </>
          }
        />
      )}
    </Backdrop>
  );
};

export default memo(MapPreviewer);
