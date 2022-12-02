import { useMemo } from 'react';

import { Action, Subject } from 'city-os-common/libs/schema';
import { useStore } from 'city-os-common/reducers';
import subjectRoutes from 'city-os-common/libs/subjectRoutes';

const useInitialRoute = (): string => {
  const {
    userProfile: { permissionGroup },
  } = useStore();

  return useMemo(() => {
    const viewableSubjects = (permissionGroup?.permission.rules || []).reduce(
      (subjects, { action, subject }) => {
        if (action === Action.VIEW) {
          subjects.add(subject);
        }
        return subjects;
      },
      new Set<Subject>(),
    );
    const initialSubject =
      [
        Subject.DASHBOARD,
        Subject.LIGHTMAP,
        Subject.DEVICE,
        Subject.GROUP,
        Subject.USER,
        Subject.RECYCLE_BIN,
        Subject.ROLE_TEMPLATE,
      ].find((subject) => viewableSubjects.has(subject)) || Subject.DEVICE;

    return subjectRoutes[initialSubject];
  }, [permissionGroup?.permission.rules]);
};

export default useInitialRoute;
