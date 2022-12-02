/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

const fakeConsole = {
  assert: (condition?: boolean, ...data: any[]) => {},
  clear: () => {},
  count: (label?: string) => {},
  countReset: (label?: string) => {},
  debug: (...data: any[]) => {},
  dir: (item?: any, options?: any) => {},
  dirxml: (...data: any[]) => {},
  error: (...data: any[]) => {},
  group: (...data: any[]) => {},
  groupCollapsed: (...data: any[]) => {},
  groupEnd: () => {},
  info: (...data: any[]) => {},
  log: (...data: any[]) => {},
  table: (tabularData?: any, properties?: string[]) => {},
  time: (label?: string) => {},
  timeEnd: (label?: string) => {},
  timeLog: (label?: string, ...data: any[]) => {},
  timeStamp: (label?: string) => {},
  trace: (...data: any[]) => {},
  warn: (...data: any[]) => {},
  profile: (label?: string | undefined) => {},
  profileEnd: (label?: string | undefined) => {},
};

const customLog = (enable = true): Console =>
  process.env.NEXT_PUBLIC_DISABLE_LOG !== '1' && enable ? console : (fakeConsole as Console);

const log = process.env.NEXT_PUBLIC_DISABLE_LOG !== '1' ? console : (fakeConsole as Console);

export default log;
export { customLog };
