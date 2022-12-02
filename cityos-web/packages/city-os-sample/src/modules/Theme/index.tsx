import { makeStyles, useTheme } from '@material-ui/core/styles';

import React, { VoidFunctionComponent, memo, useMemo } from 'react';

import Grid from '@material-ui/core/Grid';

import ItemBox from './ItemBox';
import PaletteCode from './PaletteCode';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(4),
    paddingTop: theme.spacing(2),
  },
  colorContainer: {
    width: '100%',
  },
}));

const Theme: VoidFunctionComponent = () => {
  const classes = useStyles();
  const theme = useTheme();

  const basicColorList = useMemo(
    () => [
      { label: 'Primary', color: theme.palette.primary.main },
      { label: 'Secondary', color: theme.palette.secondary.main },
      { label: 'Error', color: theme.palette.error.main },
      { label: 'Warning', color: theme.palette.warning.main },
      { label: 'Info', color: theme.palette.info.main },
      { label: 'Success', color: theme.palette.success.main },
      { label: 'Purple', color: '#5C61F4' },
      { label: 'Yellow', color: '#FBC01F' },
      { label: 'Page Title', color: theme.palette.pageContainer.title },
    ],
    [theme.palette],
  );

  const otherDarkColorList = useMemo(
    () => [
      {
        label: 'Alert Background',
        color: '#4A4A61',
      },
      {
        label: 'Blue Disabled',
        color: '#4A5A81',
      },
    ],
    [],
  );

  const otherLightColorList = useMemo(
    () => [
      {
        label: 'Alert Background',
        color: '#FFEFEF',
      },
      {
        label: 'Blue Disabled',
        color: '#E0E0E0',
      },
    ],
    [],
  );

  const colorList = useMemo(
    () =>
      theme.palette.type === 'dark'
        ? [...basicColorList, ...otherDarkColorList]
        : [...basicColorList, ...otherLightColorList],
    [basicColorList, otherDarkColorList, otherLightColorList, theme.palette.type],
  );

  return (
    <div className={classes.root}>
      <Grid container className={classes.colorContainer} spacing={2}>
        {colorList.map((color) => (
          <Grid item lg={2} md={3} sm={4} xs={6} style={{ marginBottom: theme.spacing(1) }}>
            <ItemBox label={color.label} color={color.color} />
          </Grid>
        ))}
      </Grid>
      <PaletteCode />
    </div>
  );
};

export { ItemBox, PaletteCode };
export default memo(Theme);
