import gql from 'graphql-tag';

import { CameraEventFilter, ICameraEvent, PageInfo } from '../libs/schema';

export interface CameraEventHistoryPayload {
  groupId: string;
  filter: CameraEventFilter;
  size?: number | null;
  after?: string | null;
  before?: string | null;
}

export interface CameraEventHistoryResponse {
  cameraEventHistory: {
    edges: {
      cursor: string;
      node: ICameraEvent;
    }[];
    pageInfo: PageInfo;
    totalCount: number;
  };
}

export const CAMERA_EVENT_HISTORY = gql`
  query cameraEventHistory(
    $groupId: ID!
    $filter: CameraEventFilter!
    $size: Int
    $after: String
    $before: String
  ) {
    cameraEventHistory(
      groupId: $groupId
      filter: $filter
      size: $size
      after: $after
      before: $before
    ) {
      totalCount
      pageInfo {
        hasNextPage
        endCursor
        hasPreviousPage
        beforeCursor
      }
      edges {
        node {
          deviceId
          deviceName
          time
          type
          ... on HumanShapeEvent {
            pedestrian
            gender
            clothesColor
          }
          ... on CarIdentifyEvent {
            vehicle
            numberPlate
            vehicleType
            vehicleColor
          }
          ... on HumanFlowAdvanceEvent {
            humanFlowSex
            humanFlowAge
            humanFlowImage
          }
        }
      }
    }
  }
`;
