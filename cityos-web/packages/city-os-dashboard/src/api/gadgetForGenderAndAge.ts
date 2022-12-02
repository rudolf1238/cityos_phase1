import gql from 'graphql-tag';

import { GenderAndAgeData } from '../libs/type';

interface GadgetForGenderAndAgeInput {
  deviceId: string;
  start: Date;
  end: Date;
  interval?: number /** in minutes, default value is 1440 */;
}

export interface GadgetForGenderAndAgePayload {
  input: GadgetForGenderAndAgeInput;
}

export interface GadgetForGenderAndAgeResponse {
  gadgetForGenderAndAge: GenderAndAgeData;
}

export const GADGET_FOR_GENDER_AND_AGE = gql`
  query gadgetForGenderAndAge($input: GadgetForGenderAndAgeInput!) {
    gadgetForGenderAndAge(input: $input) {
      deviceId
      deviceName
      percent {
        percentForMale
        percentForFemale
      }
      histogram {
        male
        female
      }
      history {
        male {
          type
          time
          value
        }
        female {
          type
          time
          value
        }
      }
    }
  }
`;
