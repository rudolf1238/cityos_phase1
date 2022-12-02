import gql from 'graphql-tag';

import { VideoClip } from '../libs/schema';

export interface GetVideoHistoryPayload {
  deviceId: string;
  from: Date;
  to: Date;
}

export interface GetVideoHistoryResponse {
  getVideoHistory: {
    /**  Date number in millisecond */
    expiredAt: number;
    /** The returned clips would include whole hour.
     *
     * ex. from 14:23 to 15:33 would get clips from [14:00-14:xx] to [16:00-16:xx]
     */
    clips: VideoClip[];
  };
}

export const GET_VIDEO_HISTORY = gql`
  query getVideoHistory($deviceId: String!, $from: Date!, $to: Date!) {
    getVideoHistory(deviceId: $deviceId, from: $from, to: $to) {
      expiredAt
      clips {
        url
        start
      }
    }
  }
`;
