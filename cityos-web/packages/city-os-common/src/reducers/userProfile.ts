import { Group, GroupInfo, User } from '../libs/schema';
import { StorageKey, setItem } from '../libs/storage';
import ReducerActionType from './actions';

export interface UserProfileState {
  profile: User | null;
  permissionGroup: GroupInfo | null;
  divisionGroup: Pick<Group, 'id' | 'name'> | null;
  joinedGroups: Group[] | null;
}

interface UserProfileActionSetProfile {
  type: ReducerActionType.SetProfile;
  payload: {
    profile: User;
  };
}

interface UserProfileActionSetDivisionGroup {
  type: ReducerActionType.SetDivisionGroup;
  payload: {
    divisionGroup: Pick<Group, 'id' | 'name'>;
  };
}

interface UserProfileActionResetDivisionGroup {
  type: ReducerActionType.ResetDivisionGroup;
}

interface UserProfileActionLogout {
  type: ReducerActionType.UserLogout;
}

interface UserProfileActionSetPermissionGroup {
  type: ReducerActionType.SetPermissionGroup;
  payload: { permissionGroupId: string };
}

interface UserProfileActionSetJoinedGroups {
  type: ReducerActionType.SetJoinedGroups;
  payload: {
    joinedGroups: Required<Group>[];
  };
}

export type UserProfileAction =
  | UserProfileActionSetProfile
  | UserProfileActionSetDivisionGroup
  | UserProfileActionResetDivisionGroup
  | UserProfileActionLogout
  | UserProfileActionSetPermissionGroup
  | UserProfileActionSetJoinedGroups;

export const userProfileInitialState: UserProfileState = {
  profile: null,
  permissionGroup: null,
  divisionGroup: null,
  joinedGroups: null,
};

export function userProfileReducer(
  state: UserProfileState,
  action: UserProfileAction,
): UserProfileState {
  switch (action.type) {
    case ReducerActionType.SetProfile: {
      const pGroupList = action.payload.profile.groups;
      const prevPGroup = state.permissionGroup;
      const newPGroup =
        prevPGroup && pGroupList.some(({ group }) => group.id === prevPGroup.group.id)
          ? prevPGroup
          : pGroupList[0];

      const dGroupList = state.joinedGroups;
      const prevDGroup = state.divisionGroup;
      const newDGroup =
        prevDGroup && dGroupList?.some(({ id }) => id === prevDGroup.id)
          ? prevDGroup
          : {
              id: newPGroup?.group.id,
              name: newPGroup?.group.name,
            };
      setItem(StorageKey.LANG, action.payload.profile.language);
      return {
        ...state,
        profile: action.payload.profile,
        permissionGroup: newPGroup,
        divisionGroup: newDGroup,
      };
    }
    case ReducerActionType.SetPermissionGroup: {
      const newGroup =
        state.profile?.groups.find(({ group }) => group.id === action.payload.permissionGroupId) ||
        state.permissionGroup;
      return {
        ...state,
        divisionGroup: newGroup ? { id: newGroup.group.id, name: newGroup.group.name } : null,
        permissionGroup: newGroup,
      };
    }
    case ReducerActionType.SetDivisionGroup:
      return {
        ...state,
        divisionGroup: action.payload.divisionGroup,
      };
    case ReducerActionType.ResetDivisionGroup:
      return {
        ...state,
        divisionGroup: state.permissionGroup
          ? {
              id: state.permissionGroup?.group.id,
              name: state.permissionGroup?.group.name,
            }
          : null,
      };
    case ReducerActionType.UserLogout:
      return userProfileInitialState;
    case ReducerActionType.SetJoinedGroups: {
      const dGroupList = action.payload.joinedGroups;
      const prevDGroup = state.divisionGroup;
      const getNewDGroup = () => {
        if (prevDGroup && dGroupList?.some(({ id }) => id === prevDGroup.id)) return prevDGroup;
        if (state.permissionGroup) {
          return {
            id: state.permissionGroup?.group.id,
            name: state.permissionGroup?.group.name,
          };
        }
        return null;
      };
      return {
        ...state,
        divisionGroup: getNewDGroup(),
        joinedGroups: action.payload.joinedGroups,
      };
    }
    default:
      return state;
  }
}
