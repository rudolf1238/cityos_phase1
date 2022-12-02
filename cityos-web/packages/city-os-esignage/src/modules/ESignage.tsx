// import { makeStyles } from '@material-ui/core/styles';
// import { useMutation, useQuery } from '@apollo/client';
import React, {
  //  MouseEvent,
  VoidFunctionComponent,
  memo,
  // useCallback,
  // useEffect,
  // useMemo,
  // useRef,
  // useState,
} from 'react';

// import AddIcon from '@material-ui/icons/Add';
// import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
// import Menu from '@material-ui/core/Menu';
// import MenuItem from '@material-ui/core/MenuItem';
// import MoreIcon from '@material-ui/icons/MoreHoriz';
// import Typography from '@material-ui/core/Typography';

import { Action, Subject } from 'city-os-common/libs/schema';
// import { isNumber } from 'city-os-common/libs/validators';
// import { useStore } from 'city-os-common/reducers';

// import BaseDialog from 'city-os-common/modules/BaseDialog';
import Guard from 'city-os-common/modules/Guard';
import MainLayout from 'city-os-common/modules/MainLayout';
// import ThemeIconButton from 'city-os-common/modules/ThemeIconButton';

import I18nProvider from './I18nESignageProvider';

const ESignage: VoidFunctionComponent = () => (
  <I18nProvider>
    <MainLayout>
      <Guard subject={Subject.ESIGNAGE} action={Action.VIEW}>
        <Container>
          <div>ESignage</div>
        </Container>
      </Guard>
    </MainLayout>
  </I18nProvider>
);

export default memo(ESignage);
