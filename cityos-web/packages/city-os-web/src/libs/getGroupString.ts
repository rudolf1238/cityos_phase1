import { Group } from 'city-os-common/libs/schema';

const getGroupsString = (groups: Pick<Group, 'id' | 'name'>[]): string =>
  groups
    .reduce<string[]>((acc, group) => (group.name ? acc.concat(group.name) : acc), [])
    .join(', ');

export default getGroupsString;
