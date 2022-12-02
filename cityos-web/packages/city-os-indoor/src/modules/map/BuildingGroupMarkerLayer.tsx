import { makeStyles } from '@material-ui/core/styles';
import React, { VoidFunctionComponent } from 'react';

import Box from '@material-ui/core/Box';

import { LatLng } from 'leaflet';

import DivIconMarker from './DivIconMarker';

const useStyles = makeStyles((theme) => ({
  markerContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: theme.spacing(8),
    height: theme.spacing(8),
    background: '#748aa1',
    borderRadius: '50%',
    marginTop: -29,
    marginLeft: -25,
    '&:hover': {
      background: '#5c7a9e',
    },
  },

  markerLabel: {
    color: '#ffffff',
    fontSize: theme.spacing(3),
    fontWeight: 'bold',
  },
}));

export interface Cluster {
  id: string | number | undefined;
  count: number;
  lat: number;
  lng: number;
}

interface BuildingGroupMarkerLayerLayerProps {
  clusters: Cluster[];
  handleMarkerClick?: (e: React.MouseEvent<HTMLDivElement>, cluster?: Cluster) => void;
  mapDragendDateRef?: React.MutableRefObject<Date>;
}

const BuildingGroupMarkerLayer: VoidFunctionComponent<BuildingGroupMarkerLayerLayerProps> = (
  props: BuildingGroupMarkerLayerLayerProps,
) => {
  const { clusters, handleMarkerClick = () => {}, mapDragendDateRef = undefined } = props;

  const classes = useStyles();

  return (
    <>
      {clusters.map((cluster: Cluster) => (
        <DivIconMarker
          key={cluster.id}
          markerKey={cluster.id}
          markerProps={{
            position: new LatLng(cluster.lat || 0, cluster.lng || 0),
          }}
          container={{ tagName: 'span' }}
        >
          <Box
            component="div"
            className={classes.markerContainer}
            onClick={(e: React.MouseEvent<HTMLDivElement>) => {
              if (
                mapDragendDateRef === undefined ||
                new Date().getTime() - mapDragendDateRef.current.getTime() > 1000
              ) {
                handleMarkerClick(e, cluster);
              }
            }}
          >
            <Box component="span" className={classes.markerLabel}>
              {cluster?.count || 0}
            </Box>
          </Box>
        </DivIconMarker>
      ))}
    </>
  );
};

export default BuildingGroupMarkerLayer;
