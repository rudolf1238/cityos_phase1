import gql from 'graphql-tag';

import { ResponseMSG, ResponseMSGSon } from '../libs/schema';

export interface GetResponseMSGload {
  groupId: string | undefined;
  deviceId: string;
  page: number;
  size: number;
  // type: string;
}

/*
type PartialNode = Required<
  Pick<
  MalDevice,
  'id' | 'name' | 'deviceType' | 'notifyType' | 'status'
  > 
>;
*/

export type PartialNodeSon = Pick<
  ResponseMSGSon,
  'updatedAt' | 'content' | 'name' | 'id' | 'pictureId' | 'photo' | 'status'
>;

export type PartialNode = Pick<
  ResponseMSG,
  'deviceId' | 'updatedAt' | 'content' | 'name' | 'id' | 'pictureId' | 'photo' | 'status'
>;

export type ResponseMSGNode = Pick<ResponseMSGGroup, 'value' | 'label' | 'id'>;

/*
export interface GetDeviceResponse {
  getDevices: Required<PartialDevice>[];
}
*/
export interface ResponseMSGGroup {
  value: string;
  label: string;
  id: string;
}

export interface Response {
  responsemsgFa: Required<PartialNode>;
  responsemsgSon: Array<Required<PartialNodeSon>>;
}

export interface GetMSGResponse {
  // malDevices: Required<MalDevice>[];
  getResponseMsg: {
    // totalCount: number;
    // pageInfo: {
    //   hasNextPage: boolean;
    //   endCursor: string;
    // };
    groups: ResponseMSGGroup[];
    edges: [
      {
        node: Response;
      },
    ];
  };
}

export const GET_RESPONSEMSG = gql`
  query getResponseMsg($groupId: ID, $deviceId: String, $page: Int, $size: Int) {
    getResponseMsg(groupId: $groupId, deviceIds: [$deviceId], page: $page, size: $size) {
      groups {
        id
        value
        label
      }
      edges {
        node {
          responsemsgFa {
            id
            name
            updatedAt
            content
            pictureId
            photo
            status
          }
          responsemsgSon {
            id
            name
            content
            updatedAt
            pictureId
            status
            photo
          }
        }
      }
    }
  }
`;
