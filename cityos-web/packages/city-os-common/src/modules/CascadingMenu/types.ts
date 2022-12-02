export interface CascadingMenuItem {
  id: string;
  label: string;
  appendLabel?: string;
  border?: boolean;
  color?: string;
  fill?: boolean;
  subMenu?: CascadingMenuItem[];
}
