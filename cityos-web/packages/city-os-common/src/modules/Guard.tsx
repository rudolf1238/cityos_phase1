import React, { FunctionComponent, PropsWithChildren, ReactNode } from 'react';

import { Action, Subject } from '../libs/schema';
import { useStore } from '../reducers';
import useCommonTranslation from '../hooks/useCommonTranslation';

import ErrorPage from './ErrorPage';
import NoPermissionImg from '../assets/img/no-permission.svg';
import useIsEnableRule from '../hooks/useIsEnableRule';

interface GuardProps {
  subject: Subject;
  /** enable if permission rules contains any one of the actions with the subject */
  action: Action | Action[];
  fallback?: ReactNode;
  forbidden?: boolean;
}

const Guard: FunctionComponent<GuardProps> = ({
  subject,
  action,
  fallback,
  forbidden,
  children,
}: PropsWithChildren<GuardProps>) => {
  const { t } = useCommonTranslation('error');
  const {
    userProfile: { permissionGroup },
  } = useStore();

  const isAccepted = useIsEnableRule({ subject, action });

  // permissionGroup is undefined before getUserProfile, and is null if the user doesn't belong to any group
  if (permissionGroup === null) return null;

  if (!isAccepted || forbidden) {
    return fallback !== undefined ? (
      <>{fallback}</>
    ) : (
      <ErrorPage
        text={t(
          'There are no functions available_ Please contact the person who invited you for access_',
        )}
        img={<NoPermissionImg />}
      />
    );
  }

  return <>{children}</>;
};

export default Guard;
