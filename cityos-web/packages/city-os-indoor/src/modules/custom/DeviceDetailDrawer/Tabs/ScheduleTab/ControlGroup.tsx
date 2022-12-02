import React, { VoidFunctionComponent } from 'react';

import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';

import ThemeIconButton from 'city-os-common/modules/ThemeIconButton';

const ControlGroup: VoidFunctionComponent = () => (
  <>
    <ThemeIconButton size="small" variant="standard" tooltip="Edit">
      <EditIcon fontSize="inherit" />
    </ThemeIconButton>
    <ThemeIconButton size="small" variant="standard" tooltip="Edit">
      <DeleteIcon fontSize="inherit" />
    </ThemeIconButton>
  </>
);

export default ControlGroup;
