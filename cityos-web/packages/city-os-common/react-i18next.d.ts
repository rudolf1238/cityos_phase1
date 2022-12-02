import { resources } from './src/locales/resources';

export type CommonResources = typeof resources['en-US'];

declare module 'react-i18next' {
  type DefaultResources = CommonResources;
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Resources extends CommonResources {}
}
