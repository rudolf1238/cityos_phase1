import React, { FunctionComponent, useCallback, useState } from 'react';

import { useFormContext } from 'react-hook-form';

import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import CloseIcon from '@material-ui/icons/Close';
import Grid from '@material-ui/core/Grid';
import PublishIcon from '@material-ui/icons/Publish';

import { useStore } from 'city-os-common/reducers';
import BaseDialog from 'city-os-common/modules/BaseDialog';
import Img from 'city-os-common/modules/Img';
import uploadImg, { UploadImgResponse } from 'city-os-common/api/uploadImg';

import { DetailFormData } from './types';
import useWebTranslation from '../../hooks/useWebTranslation';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(3),
    alignItems: 'center',
    padding: theme.spacing(6),
  },

  tableContainer: {
    maxHeight: 320,
  },

  desc: {
    width: 240,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  paper: {
    width: 900,
  },

  largeImage: {
    width: '100%',
    height: '60vh',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center center',
  },

  images: {
    display: 'flex',
    alignItems: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: theme.spacing(3),
  },

  imageBox: {
    position: 'relative',
  },

  image: {
    borderRadius: theme.spacing(1),
    width: theme.spacing(30),
    height: theme.spacing(30),
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center center',
  },

  clearImage: {
    position: 'absolute',
    top: -theme.spacing(1),
    right: -theme.spacing(1),
    backgroundColor: theme.palette.error.main,
    width: theme.spacing(2),
    height: theme.spacing(2),
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },

  clearImageIcon: {
    fontSize: theme.spacing(1.5),
    color: theme.palette.error.contrastText,
    marginTop: -theme.spacing(0.2),
  },

  updateImage: {
    width: theme.spacing(30),
    height: theme.spacing(30),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: theme.palette.primary.main,
    cursor: 'pointer',
    border: `${theme.spacing(0.5)}px solid ${theme.palette.primary.main}`,
    opacity: 0.75,
    '&:hover': {
      opacity: 1,
    },
    borderRadius: theme.spacing(1),
  },
}));

interface ImagesProps {
  enableModify?: boolean;
}

const Images: FunctionComponent<ImagesProps> = ({ enableModify = false }: ImagesProps) => {
  const classes = useStyles();
  const { t } = useWebTranslation(['common', 'device']);
  const {
    user,
    userProfile: { permissionGroup },
  } = useStore();
  const { setValue, getValues, watch } = useFormContext<DetailFormData>();

  const [imagePreviewOpen, setImagePreviewOpen] = useState(false);
  const [imagePreviewImageId, setImagePreviewImageId] = useState<string>();

  const handleImagePreviewOpen = useCallback((_imageId: string) => {
    setImagePreviewImageId(_imageId);
    setImagePreviewOpen(true);
  }, []);

  const handleImagePreviewOnClose = useCallback(() => {
    setImagePreviewOpen(false);
  }, []);

  const handleSelectFiles: React.FormEventHandler<HTMLInputElement> = useCallback(
    (event: React.FormEvent<HTMLInputElement>) => {
      const { files } = event.currentTarget;
      if (files && files.length > 0) {
        Array.from(files).map((file) => {
          void uploadImg({
            file,
            authorization: `Bearer ${user.accessToken || ''}`,
            groupId: permissionGroup?.group?.id,
          })
            .then((res: UploadImgResponse) => {
              // eslint-disable-next-line no-underscore-dangle
              setValue('imageIds', [...(getValues().imageIds || []), res.fileInfo._id], {
                shouldDirty: true,
              });
            })
            .catch((err) => {
              console.error(err);
            });
          return null;
        });
      }
    },
    [getValues, permissionGroup?.group?.id, setValue, user.accessToken],
  );

  const handleRemove = useCallback(
    (imageId: string) => {
      setValue(
        'imageIds',
        (getValues().imageIds || []).filter((id) => id !== imageId),
        {
          shouldDirty: true,
        },
      );
    },
    [getValues, setValue],
  );

  return (
    <div className={classes.root}>
      <Grid className={classes.images}>
        {/* {[...(Array(10) as number[])] */}
        {watch('imageIds')?.map((imageId, _index) => (
          <Grid className={classes.imageBox}>
            <Img
              id={imageId}
              className={classes.image}
              imgProps={{ onClick: () => handleImagePreviewOpen(imageId) }}
            />
            {enableModify && (
              <Grid className={classes.clearImage} onClick={() => handleRemove(imageId)}>
                <CloseIcon className={classes.clearImageIcon} />
              </Grid>
            )}
          </Grid>
        ))}
        {enableModify && (
          <Box className={classes.updateImage} component="label">
            <PublishIcon />
            <input
              type="file"
              hidden
              multiple
              accept="image/gif, image/jpeg, image/png"
              onInput={handleSelectFiles}
              onClick={(e) => {
                (e.target as HTMLInputElement).value = '';
              }}
            />
          </Box>
        )}
      </Grid>
      <BaseDialog
        open={imagePreviewOpen}
        onClose={handleImagePreviewOnClose}
        title={t('common:Preview')}
        titleAlign="center"
        titleVariant="h4"
        classes={{ dialog: classes.paper }}
        content={
          imagePreviewImageId && <Img id={imagePreviewImageId} className={classes.largeImage} />
        }
      />
    </div>
  );
};

export default Images;
