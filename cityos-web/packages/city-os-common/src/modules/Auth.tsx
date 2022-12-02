import { useRouter } from 'next/router';
import React, { FunctionComponent, PropsWithChildren, useEffect, useState } from 'react';

import { useStore } from '../reducers';

type AuthProps = Record<never, never>;

const Auth: FunctionComponent<AuthProps> = ({ children }: PropsWithChildren<AuthProps>) => {
  const router = useRouter();
  const { user } = useStore();

  // XXX: https://github.com/vercel/next.js/discussions/17443
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const isAuthorized = !!user.email;

  useEffect(() => {
    if (!isAuthorized) {
      // TODO: remove log
      if (!user.email) console.log('No user email founded');
      if (!user.refreshToken) console.log('No refresh token founded');
      console.log('Redirect to login');

      void router.push({
        pathname: '/login',
        query: {
          redirect: router.asPath,
        },
      });
    } else if (!user.deviceToken) {
      // TODO: remove log
      console.log('No device token, Redirect to device-verification');
      void router.push({
        pathname: '/device-verification',
        query: {
          redirect: router.asPath,
        },
      });
    }
  }, [isAuthorized, router, user]);

  if (!isAuthorized || !user.deviceToken) {
    return null;
  }

  return mounted ? <>{children}</> : null;
};

export default Auth;
