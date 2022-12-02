import { fade, makeStyles } from '@material-ui/core/styles';
import { useFormContext } from 'react-hook-form';
import { v4 as uuidv4 } from 'uuid';
import React, { ChangeEvent, VoidFunctionComponent, useCallback, useMemo, useState } from 'react';
import i18n from 'i18next';

import AddIcon from '@material-ui/icons/Add';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';

import { Action, Subject } from 'city-os-common/libs/schema';

import DeleteIcon from 'city-os-common/assets/icon/delete.svg';
import Guard from 'city-os-common/modules/Guard';
import NestedTable from 'city-os-common/modules/NestedTable';
import ThemeIconButton from 'city-os-common/modules/ThemeIconButton';

import { AttributesData, DetailFormData, attributeKeyRegex } from './types';
import useWebTranslation from '../../hooks/useWebTranslation';

const maxLength = 200;

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(3),
    alignItems: 'center',
    padding: theme.spacing(6, 22),

    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(6, 5),
    },
  },

  form: {
    padding: theme.spacing(0, 10),
    width: '100%',

    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(0, 2),
    },
  },

  container: {
    borderColor: fade(theme.palette.text.primary, 0.12),
  },

  row: {
    '& > :first-child': {
      paddingLeft: theme.spacing(11),
    },
  },
}));

const renderKeyName = (rowData: RowData) => rowData.keyName;
const renderValue = (rowData: RowData) => rowData.value;

type AttributeField = 'key' | 'value';

type RowData = AttributesData;

const Attributes: VoidFunctionComponent = () => {
  const classes = useStyles();
  const { t } = useWebTranslation(['device', 'common']);

  const [attributeKey, setAttributeKey] = useState<string>('');
  const [attributeValue, setAttributeValue] = useState<string>('');

  const { setValue, getValues, watch } = useFormContext<DetailFormData>();

  const handleChange = useCallback(
    (inputName: AttributeField) => (event: ChangeEvent<HTMLInputElement>) => {
      if (inputName === 'key') {
        setAttributeKey(event.target.value);
        return;
      }
      setAttributeValue(event.target.value);
    },
    [],
  );

  const handleAdd = useCallback(() => {
    const currentAttributes = getValues('attributes');
    const newAttributes = currentAttributes
      .concat({
        id: uuidv4(),
        keyName: attributeKey.trim(),
        value: attributeValue.trim(),
      })
      .sort((a, b) => a.keyName.localeCompare(b.keyName, i18n.language));
    setValue('attributes', newAttributes, { shouldDirty: true });
    setAttributeKey('');
    setAttributeValue('');
  }, [attributeKey, attributeValue, getValues, setValue]);

  const handleRemove = useCallback(
    (idInput: RowData['id']) => {
      const currentAttributes = getValues('attributes');
      const newAttributes = currentAttributes.filter(({ id }) => id !== idInput);
      setValue('attributes', newAttributes, { shouldDirty: true });
    },
    [getValues, setValue],
  );

  const renderRemoveButton = useCallback(
    (rowData: RowData) => (
      <Guard subject={Subject.DEVICE} action={Action.MODIFY} fallback={null}>
        <ThemeIconButton
          aria-label={t('common:Delete')}
          tooltip={t('common:Delete')}
          variant="standard"
          color="primary"
          size="small"
          onClick={() => handleRemove(rowData.id)}
        >
          <DeleteIcon />
        </ThemeIconButton>
      </Guard>
    ),
    [handleRemove, t],
  );

  const isValid = useMemo<boolean>(() => {
    const validatingKey = attributeKey.trim();
    const validatingValue = attributeValue.trim();
    if (validatingKey === '' || validatingValue === '') return false;
    if (validatingKey.length > maxLength || validatingValue.length > maxLength) return false;
    if (!attributeKeyRegex.test(validatingKey)) return false;
    return true;
  }, [attributeKey, attributeValue]);

  return (
    <div className={classes.root}>
      <Guard subject={Subject.DEVICE} action={Action.MODIFY} fallback={null}>
        <Grid container spacing={2} className={classes.form}>
          <Grid item xs={5}>
            <TextField
              variant="outlined"
              type="text"
              label={t('device:Attribute Name (Key)')}
              placeholder={t('device:Key')}
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={attributeKey}
              onChange={handleChange('key')}
              error={attributeKey.length > maxLength}
              helperText={
                attributeKey.length > maxLength &&
                t('common:Max_ {{count}} character', { count: maxLength })
              }
            />
          </Grid>
          <Grid item xs={5}>
            <TextField
              variant="outlined"
              type="text"
              label={t('device:Attribute Value')}
              placeholder={t('device:Value')}
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={attributeValue}
              onChange={handleChange('value')}
              error={attributeValue.length > maxLength}
              helperText={
                attributeValue.length > maxLength &&
                t('common:Max_ {{count}} character', { count: maxLength })
              }
            />
          </Grid>
          <Grid item xs={2}>
            <ThemeIconButton
              color="primary"
              variant="contained"
              type="button"
              onClick={handleAdd}
              disabled={!isValid}
            >
              <AddIcon />
            </ThemeIconButton>
          </Grid>
        </Grid>
      </Guard>
      <NestedTable
        stickyHeader
        disabledSelection
        disableNoDataMessage
        columns={[
          { title: t('device:Key'), render: renderKeyName },
          { title: t('device:Value'), render: renderValue },
          { title: '', render: renderRemoveButton },
        ]}
        data={watch('attributes') || []}
        classes={{
          container: classes.container,
          row: classes.row,
        }}
      />
    </div>
  );
};

export default Attributes;
