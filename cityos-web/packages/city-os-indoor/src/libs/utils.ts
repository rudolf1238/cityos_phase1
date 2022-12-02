import { Attribute } from 'city-os-common/libs/schema';

export const getAttrByKey = (attributes: Attribute[], key: string): Attribute =>
  attributes.filter((value: Attribute) => value.key === key)[0] || null;
