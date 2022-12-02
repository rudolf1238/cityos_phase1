import { FunctionComponent, memo, useEffect } from 'react';
import { omit } from 'lodash';
import { useQuery } from '@apollo/client';
import { useRouter } from 'next/router';

import { isString } from 'city-os-common/libs/validators';
import { useStore } from 'city-os-common/reducers';
import ReducerActionType from 'city-os-common/reducers/actions';

import { GET_USER_PROFILE, GetUserProfileResponse } from '../api/getUserProfile';
import { SEARCH_GROUPS, SearchGroupsResponse } from '../api/searchGroups';
import { changeLanguage } from '../libs/i18n';

const QueryString: FunctionComponent = () => {
  const router = useRouter();
  const {
    dispatch,
    user: { email },
    userProfile: { permissionGroup, divisionGroup, profile, joinedGroups },
  } = useStore();

  const pid = isString(router.query.pid) ? router.query.pid : undefined;
  const gid = isString(router.query.gid) ? router.query.gid : undefined;

  useQuery<GetUserProfileResponse>(GET_USER_PROFILE, {
    onCompleted: ({ userProfile }) => {
      if (pid) {
        dispatch({
          type: ReducerActionType.SetPermissionGroup,
          payload: {
            permissionGroupId: pid,
          },
        });
      }
      dispatch({
        type: ReducerActionType.SetProfile,
        payload: {
          profile: userProfile,
        },
      });
    },
    skip: !!profile || !email,
  });
  useQuery<SearchGroupsResponse>(SEARCH_GROUPS, {
    skip: !permissionGroup?.group.id,
    onCompleted: (res) => {
      dispatch({
        type: ReducerActionType.SetJoinedGroups,
        payload: {
          joinedGroups: res.searchGroups,
        },
      });
    },
    fetchPolicy: 'cache-and-network',
  });

  useEffect(() => {
    if (permissionGroup && pid !== permissionGroup.group.id) {
      const newRoute = {
        pathname: router.pathname,
        query: {
          ...router.query,
          pid: permissionGroup.group.id,
        },
      };
      void router.replace(newRoute, newRoute, { shallow: true });
    }
  }, [permissionGroup, pid, router]);

  useEffect(() => {
    if (gid && joinedGroups && divisionGroup && divisionGroup?.id !== gid) {
      const newGroup = joinedGroups.find(({ id }) => id === gid);
      if (!newGroup) {
        const newQuery = omit(router.query, 'gid');
        const newRoute = {
          pathname: router.pathname,
          query: newQuery,
        };
        void router.replace(newRoute, newRoute, { shallow: true });
      } else {
        dispatch({
          type: ReducerActionType.SetDivisionGroup,
          payload: {
            divisionGroup: {
              id: newGroup.id,
              name: newGroup.name,
            },
          },
        });
      }
    }
  }, [gid, joinedGroups, divisionGroup, permissionGroup, router, dispatch]);

  useEffect(() => {
    if (profile?.language) {
      void changeLanguage(profile.language);
    }
  }, [profile?.language]);

  return null;
};

export default memo(QueryString);
