import { makeStyles } from '@material-ui/core/styles';

import React, { VoidFunctionComponent, memo } from 'react';

import Card from '@material-ui/core/Card';
import Typography from '@material-ui/core/Typography';

import Header from 'city-os-common/modules/Header';

import CodeViewer from '../CodeViewer';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  container: {
    paddingTop: theme.spacing(2),
    width: '80%',
    maxWidth: '960px',
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
  },
  componentCard: {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(5, 6),
  },
  codeBox: {
    height: 0,
  },
}));

const HeaderSample: VoidFunctionComponent = () => {
  const classes = useStyles();

  const code = `import Header from 'city-os-common/modules/Header';

<Header
  title="headet"
  description="description"
  backLinkHref="#"
  backLinkText="Back Link"
  status="xxx"
/>`;

  return (
    <div className={classes.root}>
      <div className={classes.container}>
        <Typography variant="body1">
          頁面頂部的 header，可以自訂 title、description、backLink 等。
        </Typography>
        <Typography variant="body1">
          status 為 header 的狀態 - `PROCESSING`, `DONE`, `ERROR`」
        </Typography>
        <Card className={classes.componentCard}>
          <Header
            title="Header"
            description="description"
            backLinkHref="#"
            backLinkText="Back Link"
            status="xxx"
          />
        </Card>
        <CodeViewer code={code} highlight copy wrapLines />
      </div>
    </div>
  );
};

export default memo(HeaderSample);
