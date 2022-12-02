import { makeStyles, useTheme } from '@material-ui/core/styles';

import React, { VoidFunctionComponent, memo, useCallback, useMemo, useState } from 'react';

import Box from '@material-ui/core/Box';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

import { Subject } from 'city-os-common/libs/schema';
import SearchFieldLite from 'city-os-common/modules/SearchFieldLite';
import subjectRoutes from 'city-os-common/libs/subjectRoutes';

import useConstants from '../../hooks/useConstants';
import useRedirect from '../../hooks/useRedirect';
import useSampleTranslation from '../../hooks/useSampleTranslation';

import ComponentImage from '../ComponentImage';

const useStyles = makeStyles((theme) => ({
  root: {
    paddingTop: theme.spacing(2),
  },
  fullWidth: {
    width: '100%',
    maxWidth: theme.spacing(120),
  },
  cardRoot: { maxHeight: theme.spacing(45), overflow: 'hidden' },
  cardMedia: {
    height: theme.spacing(15),
  },
}));

const Components: VoidFunctionComponent = () => {
  const { t: tSample } = useSampleTranslation();
  const classes = useStyles();
  const theme = useTheme();

  const { to } = useRedirect();

  const { componentInfoList } = useConstants();

  const [keyword, setKeyword] = useState<string | null>(null);

  const handleSearch = useCallback((currentKeyword: string | null) => {
    setKeyword(currentKeyword);
  }, []);

  const handleClearSearch = useCallback(() => {
    setKeyword(null);
  }, []);

  const currentComponentInfoList = useMemo(
    () =>
      componentInfoList.filter(
        (componentInfo) =>
          componentInfo.label.toLowerCase().indexOf((keyword || '').toLowerCase()) !== -1,
      ),
    [componentInfoList, keyword],
  );

  return (
    <div className={classes.root}>
      <Box
        display="flex"
        flexDirection="row"
        justifyContent="center"
        marginBottom={theme.spacing(0.5)}
      >
        <SearchFieldLite
          className={classes.fullWidth}
          placeholder={tSample('common:Please enter the keyword_')}
          onSearch={handleSearch}
          onClear={handleClearSearch}
        />
      </Box>
      <Grid container spacing={2}>
        {currentComponentInfoList.map((componentInfo) => (
          <Grid item lg={4} md={6} sm={12} xs={12} key={componentInfo.id}>
            <Card className={classes.cardRoot}>
              <CardActionArea
                style={{ padding: theme.spacing(2, 1) }}
                onClick={() => {
                  void to(`${subjectRoutes[Subject.SAMPLE]}/components/${componentInfo.id}`);
                }}
              >
                <CardMedia className={classes.cardMedia} title={componentInfo.label}>
                  <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                    <ComponentImage id={componentInfo.id} />
                  </div>
                </CardMedia>
                <CardContent>
                  <Typography
                    // gutterBottom
                    variant="h5"
                    style={{ marginBottom: theme.spacing(1.5) }}
                  >
                    {componentInfo.label}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" component="p">
                    {componentInfo.description}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </div>
  );
};

export default memo(Components);
