import { makeStyles } from '@material-ui/core/styles';
import React, { FunctionComponent, PropsWithChildren } from 'react';

const useStyles = makeStyles({
  aspectRatio: {
    position: 'relative',

    '& > *': {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      margin: 'auto',
      width: '100%',
      height: '100%',
    },
  },
});

interface AspectRatioProps {
  ratio: number;
  disabledMaxWidth?: boolean;
}

const AspectRatio: FunctionComponent<AspectRatioProps> = ({
  ratio,
  disabledMaxWidth,
  children,
}: PropsWithChildren<AspectRatioProps>) => {
  const classes = useStyles();

  return (
    <div
      className={classes.aspectRatio}
      style={{
        paddingTop: `${100 / ratio}%`,
        maxWidth: disabledMaxWidth ? 'none' : `calc(var(--vh) * 100 * ${ratio})`,
      }}
    >
      {children}
    </div>
  );
};

export default AspectRatio;
