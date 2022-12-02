import { makeStyles } from '@material-ui/core/styles';

import React, { VoidFunctionComponent, memo } from 'react';

import Card from '@material-ui/core/Card';
import Typography from '@material-ui/core/Typography';

import DivisionSelector from 'city-os-common/modules/DivisionSelector';

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

const DivisionSelectorSample: VoidFunctionComponent = () => {
  const classes = useStyles();

  const code = `import DivisionSelector from 'city-os-common/modules/DivisionSelector';

<DivisionSelector label="division selector" onchange={handleGroupChange}/>`;

  return (
    <div className={classes.root}>
      <div className={classes.container}>
        <Typography variant="body1">
          用於選擇部門，大部分的 API 都會用到的 group-id 就是用這個元件選出來的
        </Typography>
        <Typography variant="body1">若無選擇，則預設為使用者所屬的部門</Typography>
        <Card className={classes.componentCard}>
          <DivisionSelector label="label" />
        </Card>
        <CodeViewer code={code} highlight copy wrapLines />
      </div>
    </div>
  );
};

export default memo(DivisionSelectorSample);
