import { TypographyVariant, useTheme } from '@material-ui/core/styles';
import React, { CSSProperties, ElementType, FunctionComponent, memo, useMemo } from 'react';

import Typography, { TypographyProps } from '@material-ui/core/Typography';

const getResponsiveFontSize = (
  text: string,
  maxWidth: number,
  {
    fontWeight,
    fontFamily = '',
    letterSpacing = 0,
  }: {
    fontWeight: CSSProperties['fontWeight'];
    fontFamily: CSSProperties['fontFamily'];
    letterSpacing: number;
  },
  suffix = '',
  suffixScale = 1,
): number => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error();
  }

  ctx.font = `${fontWeight || ''} 16px ${fontFamily}`.trim();
  const { width: textWidth } = ctx.measureText(text);

  ctx.font = `${fontWeight || ''} ${16 * suffixScale}px ${fontFamily}`.trim();
  const { width: suffixWidth } = ctx.measureText(suffix);

  const width = textWidth + suffixWidth;
  if (width === 0) {
    return 0;
  }

  return Math.max(0, (16 * (maxWidth - (text.length + suffix.length) * letterSpacing)) / width);
};

type ResponsiveTypographyProps<C extends ElementType> = Omit<
  TypographyProps<C, { component?: C }>,
  'variant'
> & {
  variant: TypographyVariant;
  text: string;
  suffix?: string;
  suffixScale?: number;
  maxWidth: number;
  maxFontSize?: number;
  fontWeight?: CSSProperties['fontWeight'];
  fontFamily?: CSSProperties['fontFamily'];
  letterSpacing?: number;
};

const ResponsiveTypography = <C extends ElementType>({
  variant,
  component,
  text,
  suffix,
  suffixScale = 1,
  maxWidth,
  maxFontSize,
  fontWeight,
  fontFamily,
  letterSpacing = 0,
  ...props
}: ResponsiveTypographyProps<C>): ReturnType<FunctionComponent<ResponsiveTypographyProps<C>>> => {
  const theme = useTheme();

  const fontSize = useMemo(() => {
    const responsiveFontSize = getResponsiveFontSize(
      `${text}${suffix || ''}`,
      maxWidth,
      {
        fontWeight:
          fontWeight ?? theme.typography[variant].fontWeight ?? theme.typography.fontWeightRegular,
        fontFamily:
          fontFamily || theme.typography[variant].fontFamily || theme.typography.fontFamily,
        letterSpacing,
      },
      suffix,
      suffixScale,
    );
    if (maxFontSize === undefined) return responsiveFontSize;
    return responsiveFontSize <= maxFontSize ? responsiveFontSize : maxFontSize;
  }, [
    fontFamily,
    fontWeight,
    letterSpacing,
    maxWidth,
    maxFontSize,
    text,
    theme.typography,
    variant,
    suffix,
    suffixScale,
  ]);

  return (
    <Typography
      {...props}
      variant={variant}
      component={component}
      style={{
        ...props.style,
        fontSize,
      }}
    >
      {text}
      {suffix && (
        <Typography
          variant={variant}
          component="span"
          style={{
            ...props.style,
            fontSize: fontSize * suffixScale,
          }}
        >
          {suffix}
        </Typography>
      )}
    </Typography>
  );
};

export default memo(ResponsiveTypography);
