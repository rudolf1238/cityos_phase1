import { makeStyles } from '@material-ui/core/styles';
import React, { VoidFunctionComponent } from 'react';

import Box from '@material-ui/core/Box';

import { LatLng } from 'leaflet';

import { BuildingEdge } from '../../libs/type';

import DivIconMarker from './DivIconMarker';

const useStyles = makeStyles((theme) => ({
  markerContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: theme.spacing(5),
    height: theme.spacing(5),
    background: '#748aa1',
    borderRadius: theme.spacing(1),
    marginTop: -17,
    marginLeft: -13,
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

interface BuildingMarkerLayerProps {
  buildingEdgeList: BuildingEdge[];
  handleMarkerClick?: (e: React.MouseEvent<HTMLDivElement>, buildingEdge?: BuildingEdge) => void;
  mapDragendDateRef?: React.MutableRefObject<Date>;
}

const BuildingMarkerLayer: VoidFunctionComponent<BuildingMarkerLayerProps> = (
  props: BuildingMarkerLayerProps,
) => {
  const { buildingEdgeList, handleMarkerClick = () => {}, mapDragendDateRef = undefined } = props;

  const classes = useStyles();

  return (
    <>
      {buildingEdgeList.map((buildingEdge: BuildingEdge) => (
        <DivIconMarker
          key={buildingEdge.node.deviceId}
          markerKey={buildingEdge.node.deviceId}
          markerProps={{
            position: new LatLng(
              buildingEdge.node?.location?.lat || 0,
              buildingEdge.node?.location?.lng || 0,
            ),
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
                handleMarkerClick(e, buildingEdge);
              }
            }}
          >
            <Box component="span" className={classes.markerLabel}>
              {buildingEdge?.deviceCount || 0}
            </Box>
          </Box>
        </DivIconMarker>
      ))}
    </>
  );
};

export default BuildingMarkerLayer;
