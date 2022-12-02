import { fade, makeStyles } from '@material-ui/core/styles';
import React, {
  ChangeEvent,
  VoidFunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import isEqual from 'lodash/isEqual';

import { Action, Rule, Subject } from 'city-os-common/libs/schema';
import { Column } from 'city-os-common/modules/NestedTable/NestedTableProvider';
import useSubjectTranslation from 'city-os-common/src/hooks/useSubjectTranslation';

import CircleCheckbox from 'city-os-common/modules/Checkbox';
import NestedTable from 'city-os-common/modules/NestedTable';

import { basicTable, isRuleExisted, subtractRules } from '../../libs/permission';
import useActionTranslation from '../../hooks/useActionTranslation';
import useWebTranslation from '../../hooks/useWebTranslation';

const useStyles = makeStyles((theme) => ({
  row: {
    backgroundColor: theme.palette.background.oddRow,

    '&:not(:last-child)': {
      borderBottom: `1px solid ${fade(theme.palette.text.primary, 0.12)}`,
    },
  },
}));

interface RenderAction {
  action: Action;
  disabled: boolean;
  checked: boolean;
}

interface RowData {
  subject: Subject;
  actions: RenderAction[];
}

interface PermissionTableProps {
  rules?: Rule[];
  disabled?: boolean;
  acceptedRules?: Rule[];
  onChange?: (newRules: Rule[]) => void;
}

const PermissionTable: VoidFunctionComponent<PermissionTableProps> = ({
  rules: initialRules,
  disabled,
  acceptedRules,
  onChange,
}: PermissionTableProps) => {
  const classes = useStyles();
  const { tAction } = useActionTranslation();
  const { tSubject } = useSubjectTranslation();
  const { t } = useWebTranslation('common');
  const [rules, setRules] = useState<Rule[]>([]);

  const renderManagement = useCallback((rowData: RowData) => <>{tSubject(rowData.subject)}</>, [
    tSubject,
  ]);

  const onChangePermission = useCallback(
    (newSubject: Subject, newAction: Action) => (event: ChangeEvent<HTMLInputElement>) => {
      const { checked } = event.target;
      setRules((prev) => {
        let newRules: Rule[];
        if (checked) {
          const hasView = prev.find(
            ({ subject, action }) => subject === newSubject && action === Action.VIEW,
          );
          newRules =
            hasView || newAction === Action.VIEW
              ? prev.concat({ subject: newSubject, action: newAction })
              : prev.concat(
                  { subject: newSubject, action: Action.VIEW },
                  { subject: newSubject, action: newAction },
                );
        } else {
          newRules = prev.filter(({ subject, action }) =>
            newAction === Action.VIEW
              ? subject !== newSubject
              : subject !== newSubject || action !== newAction,
          );
        }
        if (onChange && !Object.is(prev, newRules)) {
          window.setTimeout(() => onChange(newRules));
        }
        return newRules;
      });
    },
    [onChange],
  );

  const renderOption = useCallback(
    (action: Action) => ({ subject, actions }: RowData) => {
      const renderAction = actions.find((row) => row.action === action);
      return (
        renderAction && (
          <CircleCheckbox
            checked={renderAction.checked}
            disabled={renderAction.disabled}
            onChange={onChangePermission(subject, action)}
          />
        )
      );
    },
    [onChangePermission],
  );

  const permissionColumns = useMemo<Column<RowData>[]>(
    () => [
      {
        title: t('Functions'),
        field: 'subject',
        render: renderManagement,
      },
      ...Object.values(Action).map((action) => ({
        title: tAction(action),
        render: renderOption(action),
      })),
    ],
    [t, tAction, renderManagement, renderOption],
  );

  const tableData: RowData[] = useMemo(() => {
    const readOnlyRules = acceptedRules ? subtractRules(rules, acceptedRules) : [];
    const newTableData: RowData[] = [];
    (Object.entries(basicTable) as [Subject, Action[]][]).forEach(([subject, actions]) => {
      if (!acceptedRules || isRuleExisted(acceptedRules, subject, Action.VIEW)) {
        const renderActions: RenderAction[] = [...actions].map((action: Action) => ({
          action,
          checked: isRuleExisted(rules, subject, action),
          disabled:
            disabled ||
            (!!acceptedRules && !isRuleExisted(acceptedRules, subject, action)) ||
            (action === Action.VIEW && isRuleExisted(readOnlyRules, subject)),
        }));
        newTableData.push({
          subject,
          actions: renderActions,
        });
      }
    });
    return newTableData;
  }, [disabled, rules, acceptedRules]);

  useEffect(() => {
    if (initialRules && !isEqual(initialRules, rules)) {
      setRules(initialRules);
    }
  }, [rules, initialRules]);

  return (
    <NestedTable
      columns={permissionColumns}
      data={tableData}
      classes={{ row: classes.row }}
      disabledSelection
      disableNoDataMessage
    />
  );
};

export default PermissionTable;
