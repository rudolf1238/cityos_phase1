import { makeStyles } from '@material-ui/core/styles';

import React, { VoidFunctionComponent, memo } from 'react';
import dynamic from 'next/dynamic';

import Card from '@material-ui/core/Card';
import Typography from '@material-ui/core/Typography';

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
    height: theme.spacing(80),
    width: '100%',
  },

  baseMapContainer: {
    width: '100%',
    height: '100%',
  },
}));

const BaseMapContainerSample: VoidFunctionComponent = () => {
  const classes = useStyles();
  const BaseMapContainer = dynamic(() => import('city-os-common/modules/map/BaseMapContainer'), {
    ssr: false,
  });

  const code = `import dynamic from 'next/dynamic';

() => {
  const BaseMapContainer = dynamic(() => import('city-os-common/modules/map/BaseMapContainer'), {
    ssr: false,
  });
  
  return (
    <BaseMapContainer
      zoom={10}
      center={[25, 121.5]}
      disableDraw
      className={classes.baseMapContainer}
    >
      <div /> {/* 元件一定要有 children */}
    </BaseMapContainer>
  );
}`;

  return (
    <div className={classes.root}>
      <div className={classes.container}>
        <Typography variant="body1">
          地圖元件的基礎元件，可以設定地圖的中心點與縮放等級...等。
        </Typography>
        <Typography variant="body1">會根據系統語言、主題調整地圖圖層</Typography>
        <Typography variant="body2">
          因為 CityOS Web V2 為 nextjs 這種 SSR 框架，所以使用到 window 物件的 leaflet
          相關元件都需要使用動態載入的方式處理
        </Typography>
        <Card className={classes.componentCard}>
          <BaseMapContainer
            zoom={10}
            center={[25, 121.5]}
            disableDraw
            className={classes.baseMapContainer}
          >
            <div />
          </BaseMapContainer>
        </Card>
        <CodeViewer code={code} highlight copy wrapLines />
      </div>
    </div>
  );
};

export default memo(BaseMapContainerSample);
