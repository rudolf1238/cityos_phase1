import gql from 'graphql-tag';

import { MapClusters, MapDeviceFilter } from '../libs/schema';

export interface SearchClustersOnMapPayload {
  groupId: string;
  filter?: MapDeviceFilter | null;
  level?: number | null;
}

export interface SearchClustersOnMapResponse {
  searchClustersOnMap: MapClusters;
}

export const SEARCH_CLUSTERS_ON_MAP = gql`
  query searchClustersOnMap($groupId: ID!, $filter: MapDeviceFilter, $level: Int) {
    searchClustersOnMap(groupId: $groupId, filter: $filter, level: $level) {
      cluster {
        location {
          lat
          lng
        }
        count
      }
      gpsRect {
        sw {
          lat
          lng
        }
        ne {
          lat
          lng
        }
      }
    }
  }
`;
