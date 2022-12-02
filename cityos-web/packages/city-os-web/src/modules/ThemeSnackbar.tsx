import { makeStyles } from '@material-ui/core/styles';
import React, { VoidFunctionComponent, useCallback } from 'react';

import Alert from '@material-ui/lab/Alert';
import Snackbar from '@material-ui/core/Snackbar';

import { useStore } from 'city-os-common/reducers';
import ReducerActionType from 'city-os-common/reducers/actions';

const useStyles = makeStyles((theme) => ({
  alert: {
    paddingRight: theme.spacing(6),
    paddingLeft: theme.spacing(6),
    textAlign: 'center',
    whiteSpace: 'pre-wrap',

    '& .MuiAlert-message': {
      color: theme.palette.primary.contrastText,
    },
  },
}));

const ThemeSnackbar: VoidFunctionComponent = () => {
  const classes = useStyles();
  const { snackbar, dispatch } = useStore();

  const handleCloseSnackbar = useCallback(() => {
    dispatch({
      type: ReducerActionType.HideSnackbar,
    });
  }, [dispatch]);

  return (
    <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={handleCloseSnackbar}>
      <Alert icon={false} variant="filled" severity={snackbar.severity} className={classes.alert}>
        {snackbar.message}
      </Alert>
    </Snackbar>
  );
};

export default ThemeSnackbar;
