import { useTheme } from '@material-ui/core/styles';
import React, { SVGProps, VoidFunctionComponent, memo } from 'react';

interface DownloadIconProps extends SVGProps<SVGSVGElement> {
  animated?: boolean;
}

const DownloadIcon: VoidFunctionComponent<DownloadIconProps> = ({
  animated,
  ...props
}: DownloadIconProps) => {
  const theme = useTheme();

  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M16 11L12 15M12 15L8 11M12 15V4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M3 20H20" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      {animated && (
        <path opacity="0.5" d="M1.5 20 H0" stroke={theme.palette.secondary.main} strokeWidth="3">
          <animate
            attributeName="d"
            dur="1s"
            values="M1.5 20 H0;M1.5 20 H21.5"
            repeatCount="indefinite"
          />
        </path>
      )}
    </svg>
  );
};

export default memo(DownloadIcon);
