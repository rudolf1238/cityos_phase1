import { useTheme } from '@material-ui/core/styles';

import React, { VoidFunctionComponent, memo } from 'react';

import { Typography } from '@material-ui/core';

import darkTheme from 'city-os-common/styles/darkTheme';
import lightTheme from 'city-os-common/styles/lightTheme';

import CodeViewer from '../CodeViewer';
import useSampleTranslation from '../../hooks/useSampleTranslation';

const PaletteCode: VoidFunctionComponent = () => {
  const theme = useTheme();
  const { t: tSample } = useSampleTranslation();

  return (
    <div>
      <Typography variant="h5" gutterBottom>
        {tSample('sample:Palette')}
      </Typography>
      <CodeViewer
        format
        highlight
        showLineNumbers
        wrapLines
        copy
        code={JSON.stringify(
          theme.palette.type === 'dark' ? darkTheme.palette : lightTheme.palette,
        )}
      />
    </div>
  );
};

export default memo(PaletteCode);
