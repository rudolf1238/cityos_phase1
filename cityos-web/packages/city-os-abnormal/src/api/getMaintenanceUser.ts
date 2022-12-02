import gql from 'graphql-tag';

export interface GetMaintenceUserload {
  groupId: string | undefined;
  deviceId: string;
  // type: string;
}

export interface GetMaintenceUserResponse {
  // malDevices: Required<MalDevice>[];
  getMaintenanceUser: {
    edge: [
      {
        id: string;
        name: string;
        email: string;
      },
    ];
  };
}

export const GET_MAINTENANCEUSER = gql`
  query getMaintenanceUser($groupId: ID, $deviceId: String) {
    getMaintenanceUser(groupId: $groupId, deviceId: $deviceId) {
      edge {
        id
        name
        email
      }
    }
  }
`;
