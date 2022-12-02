import { Theme, useTheme } from '@material-ui/core/styles';
import React, { VoidFunctionComponent, useCallback, useEffect, useMemo } from 'react';

import { CascadingMenuItem } from './CascadingMenu/types';
import { Level } from '../libs/schema';
import { useStore } from '../reducers';
import ReducerActionType from '../reducers/actions';

import CascadingMenu from './CascadingMenu';

const getColor = (theme: Theme, level: Level | null) => {
  if (level === Level.ROOT) return theme.palette.group.root;
  if (level === Level.PROJECT) return theme.palette.group.project;
  if (level === Level.PARENT) return theme.palette.group.parent;
  return theme.palette.group.leaf;
};

const getFill = (level: Level | null) => {
  if (level === Level.ROOT || level === Level.PROJECT) return true;
  return false;
};

interface DivisionSelectorProps {
  label?: string;
  classes?: string;
  onChange?: (selectedId: string) => void;
}

const DivisionSelector: VoidFunctionComponent<DivisionSelectorProps> = ({
  label,
  classes: customClass,
  onChange,
}: DivisionSelectorProps) => {
  const theme = useTheme();
  const {
    userProfile: { permissionGroup, divisionGroup, joinedGroups },
    dispatch,
  } = useStore();

  const selectedPath = useMemo<string | undefined>(() => {
    const dGroupId = divisionGroup?.id;
    if (!dGroupId || !joinedGroups || !permissionGroup) return undefined;

    const selectedGroup = joinedGroups.find((group) => group.id === dGroupId);
    if (!selectedGroup) return undefined;
    if (selectedGroup.id === permissionGroup.group.id) return selectedGroup.id;

    const rootIdx = selectedGroup.ancestors?.findIndex((id) => id === permissionGroup.group.id);
    if (rootIdx === -1) return undefined;

    const pathArr = selectedGroup.ancestors?.slice(rootIdx);
    if (!pathArr) return undefined;
    pathArr.push(dGroupId);
    return pathArr.join('.');
  }, [divisionGroup?.id, joinedGroups, permissionGroup]);

  const handleDivisionChange = useCallback(
    (_path: string, item: CascadingMenuItem | undefined) => {
      if (!item) return;
      if (onChange) {
        onChange(item.id);
      } else {
        dispatch({
          type: ReducerActionType.SetDivisionGroup,
          payload: {
            divisionGroup: {
              id: item.id,
              name: item.label,
            },
          },
        });
      }
    },
    [onChange, dispatch],
  );

  const makeMenuTree = useCallback(
    (subGroupId: string): CascadingMenuItem | undefined => {
      const subGroup = joinedGroups?.find(({ id }) => id === subGroupId);
      if (!subGroup) return undefined;
      const subGroupMenu: CascadingMenuItem = {
        id: subGroup.id,
        label: subGroup.name,
        appendLabel: ` (${subGroup.deviceCount ?? 0})`,
        border: subGroup.level !== Level.LEAF,
        color: getColor(theme, subGroup.level),
        fill: getFill(subGroup.level),
      };
      if (!subGroup.subGroups || subGroup.subGroups.length === 0) return subGroupMenu;
      return {
        ...subGroupMenu,
        subMenu: subGroup.subGroups
          .map((subSubGroupId) => makeMenuTree(subSubGroupId))
          .filter((group): group is CascadingMenuItem => !!group),
      };
    },
    [joinedGroups, theme],
  );

  const root = useMemo(() => {
    const rootGroup = joinedGroups?.find((group) => group.id === permissionGroup?.group.id);
    if (!rootGroup) return null;
    const { id, name, level, subGroups, deviceCount } = rootGroup;
    return { id, name, level, subGroups, deviceCount };
  }, [joinedGroups, permissionGroup]);

  const menu = useMemo((): CascadingMenuItem[] => {
    if (!root) return [];
    const rootMenu: CascadingMenuItem = {
      id: root.id,
      label: root.name,
      appendLabel: ` (${root.deviceCount ?? 0})`,
      border: root.level !== Level.LEAF,
      color: getColor(theme, root.level),
      fill: getFill(root.level),
    };
    if (!root.subGroups || root.subGroups.length === 0) return [rootMenu];
    const newTree = {
      ...rootMenu,
      subMenu: root.subGroups
        .map((subGroupId) => makeMenuTree(subGroupId))
        .filter((group): group is CascadingMenuItem => !!group),
    };
    return [newTree];
  }, [makeMenuTree, theme, root]);

  useEffect(
    () => () => {
      dispatch({
        type: ReducerActionType.ResetDivisionGroup,
      });
    },
    [dispatch],
  );

  return (
    <div className={customClass}>
      <CascadingMenu
        label={label}
        menu={menu}
        enableBreadcrumb
        path={selectedPath}
        displayText={root?.name}
        onPathChange={handleDivisionChange}
      />
    </div>
  );
};

export default DivisionSelector;
