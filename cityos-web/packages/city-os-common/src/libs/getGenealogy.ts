import { Group } from './schema';

const getGenealogy = (groupId: string, groupList: Group[]): string => {
  const targetGroup = groupList.find(({ id }) => id === groupId);
  if (!targetGroup) return '';
  if (!targetGroup.ancestors) return targetGroup.name;
  return targetGroup.ancestors
    .reduce(
      (nodes, ancestor) => {
        const ancestorData = groupList.find((group) => group.id === ancestor);
        if (ancestorData) {
          nodes.push({
            id: ancestorData.id,
            name: ancestorData.name,
            ancestors: ancestorData.ancestors || [],
          });
        }
        return nodes;
      },
      [
        {
          id: targetGroup.id,
          name: targetGroup.name,
          ancestors: targetGroup.ancestors,
        },
      ],
    )
    .sort((a, b) => a.ancestors.length - b.ancestors.length)
    .map(({ name }) => name || '')
    .join(' > ');
};

export default getGenealogy;
