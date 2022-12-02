import { makeStyles } from '@material-ui/core/styles';
import React, {
  FunctionComponent,
  PropsWithChildren,
  ReactNode,
  memo,
  useCallback,
  useState,
} from 'react';
import clsx from 'clsx';

import AddIcon from '@material-ui/icons/Add';
import Button from '@material-ui/core/Button';
import EditIcon from '@material-ui/icons/Edit';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

import BaseDialog from 'city-os-common/modules/BaseDialog';
import DeleteIcon from 'city-os-common/assets/icon/delete.svg';
import ThemeIconButton from 'city-os-common/src/modules/ThemeIconButton';

import useAutomationTranslation from '../../hooks/useAutomationTranslation';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    position: 'relative',
    flexDirection: 'column',
    border: `1px solid ${theme.palette.grey[300]}`,
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.background.paper,
    width: 320,
    height: 400,
  },

  emptyCard: {
    width: 160,
  },

  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },

  headerWithButton: {
    justifyContent: 'space-between',
    padding: theme.spacing(0, 1, 0, 3),
  },

  iconButtons: {
    display: 'flex',
    gap: theme.spacing(2),
  },

  content: {
    flex: 1,
    backgroundColor: theme.palette.background.light,
    padding: theme.spacing(3),
    borderEndStartRadius: theme.shape.borderRadius,
    borderEndEndRadius: theme.shape.borderRadius,
    overflow: 'auto',

    '&::-webkit-scrollbar': {
      borderRadius: `0 0 ${theme.shape.borderRadius}px 0`,
    },
  },

  addContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',

    '& > span': {
      position: 'absolute',
      top: '50%',
      transform: 'translateY(-50%)',
    },
  },

  addButton: {
    width: 48,
    height: 48,
  },

  deleteDialog: {
    width: 600,
    height: 300,
  },

  deleteContent: {
    height: '100%',
  },

  dialogButton: {
    alignSelf: 'center',
  },
}));

interface RuleCardBaseProps {
  index: number;
  title: string;
  classes?: {
    root?: string;
    title?: string;
  };
  onAdd?: () => void;
  onEdit?: () => void;
  onDelete?: (cardIdx: number) => void;
  children?: ReactNode;
}

const RuleCardBase: FunctionComponent<RuleCardBaseProps> = ({
  index,
  title,
  classes: customClasses,
  onAdd,
  onEdit,
  onDelete,
  children,
}: PropsWithChildren<RuleCardBaseProps>) => {
  const classes = useStyles();
  const { t } = useAutomationTranslation('common');
  const [deleteIdx, setDeleteIdx] = useState<number>();

  const handleOpenDeleteDialog = useCallback(() => {
    setDeleteIdx(index);
  }, [index]);

  const handleCloseDeleteDialog = useCallback(() => {
    setDeleteIdx(undefined);
  }, []);

  const handleDelete = useCallback(() => {
    if (onDelete && deleteIdx !== undefined) {
      onDelete(deleteIdx);
    }
    setDeleteIdx(undefined);
  }, [deleteIdx, onDelete]);

  return (
    <div className={clsx(classes.root, { [classes.emptyCard]: !children }, customClasses?.root)}>
      <div className={clsx(classes.header, { [classes.headerWithButton]: !!children })}>
        <Typography variant="subtitle1" className={customClasses?.title}>
          {title}
        </Typography>
        <div className={classes.iconButtons}>
          {onDelete && (
            <ThemeIconButton
              variant="standard"
              color="primary"
              size="small"
              tooltip={t('Delete')}
              onClick={handleOpenDeleteDialog}
            >
              <DeleteIcon fontSize="small" />
            </ThemeIconButton>
          )}
          {onEdit && (
            <ThemeIconButton
              variant="standard"
              color="primary"
              size="small"
              tooltip={t('Edit')}
              onClick={onEdit}
            >
              <EditIcon fontSize="small" />
            </ThemeIconButton>
          )}
        </div>
      </div>
      <div className={classes.content}>
        {children || (
          <div className={classes.addContent}>
            <ThemeIconButton
              variant="contained"
              className={classes.addButton}
              tooltip={t('common:Create')}
              onClick={onAdd}
            >
              <AddIcon />
            </ThemeIconButton>
          </div>
        )}
      </div>
      <BaseDialog
        open={deleteIdx !== undefined}
        onClose={handleCloseDeleteDialog}
        title={t('common:Are you sure you want to delete?')}
        content={
          <Grid
            container
            direction="column"
            justify="space-between"
            className={classes.deleteContent}
          >
            <Typography>
              {t('automation:This {{item}} no longer will be in use_', {
                item: t('automation:card'),
              })}
            </Typography>
            <Button
              variant="contained"
              size="small"
              color="primary"
              className={classes.dialogButton}
              onClick={handleDelete}
            >
              {t('common:Delete')}
            </Button>
          </Grid>
        }
        classes={{
          dialog: classes.deleteDialog,
        }}
      />
    </div>
  );
};

export default memo(RuleCardBase);
