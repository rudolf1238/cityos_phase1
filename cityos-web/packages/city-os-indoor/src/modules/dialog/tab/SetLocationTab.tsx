import { makeStyles } from '@material-ui/core/styles';

import React, { VoidFunctionComponent, memo, useCallback, useEffect, useMemo } from 'react';

import dynamic from 'next/dynamic';

import Button from '@material-ui/core/Button';
import Skeleton from '@material-ui/lab/Skeleton';
import TextField from '@material-ui/core/TextField';

import { useLazyQuery } from '@apollo/client';
import debounce from 'lodash/debounce';
import update from 'immutability-helper';

import { GET_GPS, GetGPSPayload, GetGPSResponse } from '../../../api/getGPS';
import useIndoorTranslation from '../../../hooks/useIndoorTranslation';

import { useDialogContext } from '../DialogProvider';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    height: '100%',
    width: '100%',
  },

  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: theme.spacing(4),
  },

  desc: {
    fontSize: 16,
    marginTop: theme.spacing(2),
  },

  location: {
    display: 'flex',
    flexDirection: 'row',
    marginTop: theme.spacing(3.625),
  },

  map: {
    flexGrow: 1,
    marginTop: theme.spacing(2),
    width: '100%',
    position: 'relative',
  },

  locationInput: {
    width: theme.spacing(66.5),
    marginRight: theme.spacing(2),
  },

  locationButton: {
    height: theme.spacing(6.875),
    padding: '20px 60px',
  },

  mapSkeleton: {
    width: '100%',
    height: '100%',
  },
}));

const SetLocationTab: VoidFunctionComponent = () => {
  const classes = useStyles();

  const { t } = useIndoorTranslation(['indoor']);

  const { address, setAddress, building, setBuilding, map } = useDialogContext();

  const [getGPS, { data: getGPSData }] = useLazyQuery<GetGPSResponse, GetGPSPayload>(GET_GPS);

  const debounceSetAddress = useMemo(
    () =>
      debounce((a: string) => {
        void getGPS({ variables: { address: a } });
        setAddress(a);
      }, 500),
    [getGPS, setAddress],
  );

  useEffect(() => {
    void getGPS({ variables: { address } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFindLocation = useCallback(() => {
    if (map && building && getGPSData) {
      map.setView([getGPSData.getLatLonByAddress.lat, getGPSData.getLatLonByAddress.lng]);
      setBuilding(
        update(building, {
          location: {
            $set: {
              lat: getGPSData?.getLatLonByAddress.lat || 0,
              lng: getGPSData?.getLatLonByAddress.lng || 0,
            },
          },
        }),
      );
    }
  }, [building, getGPSData, map, setBuilding]);

  const LoadingMap = useMemo(
    () => <Skeleton variant="rect" className={classes.mapSkeleton} />,
    [classes.mapSkeleton],
  );

  const LatLngMap = useMemo(
    () =>
      dynamic(() => import('../special/LatLngMap'), {
        loading: () => LoadingMap,
        ssr: false,
      }),
    [LoadingMap],
  );

  return (
    <div className={classes.root}>
      <span className={classes.title}>{t('indoor:Set Location')}</span>
      <span className={classes.desc}>{t(`indoor:Insert address to set building's location_`)}</span>
      <div className={classes.location}>
        <TextField
          type="text"
          required
          variant="outlined"
          label={t('indoor:Address')}
          placeholder={t('indoor:Insert address')}
          className={classes.locationInput}
          InputLabelProps={{
            shrink: true,
          }}
          onChange={(e) => {
            if (e.target.value) {
              debounceSetAddress(e.target.value);
            }
          }}
          defaultValue={address}
        />
        <Button
          variant="contained"
          color="primary"
          className={classes.locationButton}
          onClick={() => handleFindLocation()}
        >
          {t('indoor:Find')}
        </Button>
      </div>
      <div className={classes.map}>
        <LatLngMap />
      </div>
    </div>
  );
};

export default memo(SetLocationTab);
