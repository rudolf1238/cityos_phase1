export interface BasicQuery {
  pid?: string;
}

export interface ComponentPageQuery extends BasicQuery {
  id?: string | string[];
}

export enum ComponentId {
  DIVISION_SELECTOR = 'division-selector',
  HEADER = 'header',
  BASE_MAP_CONTAINER = 'base-map-container',
}

export interface ComponentInfo {
  id: ComponentId;
  label: string;
  description: string;
}

export type ComponentInfoList = ComponentInfo[];

export type ComponentConfig = Record<ComponentId, { label: string; description: string }>;
