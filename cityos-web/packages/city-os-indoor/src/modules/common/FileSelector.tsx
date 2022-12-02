import React, { VoidFunctionComponent, useCallback, useEffect, useRef, useState } from 'react';

import { Box, Button, LinearProgress, LinearProgressProps, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { useStore } from 'city-os-common/reducers';
import BaseDialog from 'city-os-common/modules/BaseDialog';

import I18nMapProvider from '../I18nIndoorProvider';
import UploadService from '../../api/fileUpload';
import useIndoorTranslation from '../../hooks/useIndoorTranslation';

function LinearProgressWithLabel(props: LinearProgressProps & { value: number }) {
  return (
    <Box display="flex" alignItems="center">
      <Box width="100%" mr={1}>
        <LinearProgress variant="determinate" {...props} />
      </Box>
      <Box minWidth={35}>
        <Typography variant="body2" color="textSecondary">{`${Math.round(
          // eslint-disable-next-line react/destructuring-assignment
          props.value,
        )}%`}</Typography>
      </Box>
    </Box>
  );
}

type FileInfoType = {
  _id: string;
  fieldname: string;
  filename: string;
  mimetype: string;
  originalname: string;
  size: number;
};

type UploadedFileType = {
  returnCode: string;
  message: string;
  fileInfo: FileInfoType;
};

const useStyles = makeStyles((theme) => ({
  form: {
    width: '65vw',
    height: '100vw',
  },

  textField: {
    flex: 1,
    maxWidth: 360,
  },
  mapSkeleton: {
    width: '100%',
    height: '100%',
    borderRadius: theme.spacing(1),
    justifyContent: 'center',
  },
  bodyContainer: {
    height: '60%',
    width: '100%',
    paddingTop: theme.spacing(-1),
    paddingBottom: theme.spacing(1),
    justifyContent: 'center',
  },
  basicInfo: {
    display: 'flex',
    gap: theme.spacing(1),
    justifyContent: 'center',
    paddingTop: theme.spacing(1),
  },
  dialog: {
    width: 600,
    height: 270,
  },
  dialogContent: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    marginBottom: 0,
  },

  dialogButton: {
    alignSelf: 'center',
    height: 58,
    marginBottom: theme.spacing(1),
    marginRight: theme.spacing(3),
  },
  desc: {
    paddingRight: theme.spacing(2),
  },
}));

interface FileSelectorProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onClose: (imageId: string | undefined) => void;
}

const FileSelector: VoidFunctionComponent<FileSelectorProps> = ({
  open,
  setOpen,
  onClose,
}: FileSelectorProps) => {
  const [newImageId, setImageId] = useState<string | undefined>('');
  const { t } = useIndoorTranslation(['indoor', 'common']);
  const classes = useStyles();
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [progressInfos, setProgressInfos] = useState<{
    val: {
      percentage: number;
      fileName: string;
    }[];
  }>({ val: [] });
  const [message, setMessage] = useState<string[]>([]);
  const progressInfosRef = useRef(null);
  const {
    user,
    userProfile: { permissionGroup },
  } = useStore();
  const AccessToken = `Bearer ${user.accessToken || ''}`;
  const groupId = permissionGroup?.group?.id || '';

  const upload = React.useCallback(
    async (idx: number, file: File) => {
      // const progressInfosLocal: any[] = [...progressInfosRef.current.val];
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
      const progressInfosLocal: any[] = [...(progressInfosRef as any).current.val];

      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result: any = await UploadService.upload(
          file,
          (event: ProgressEvent) => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            // eslint-disable-next-line no-restricted-globals, @typescript-eslint/no-unsafe-member-access
            progressInfosLocal[idx].percentage = Math.round((100 * event.loaded) / event.total);
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            setProgressInfos({ val: progressInfosLocal });
          },
          AccessToken,
          groupId,
        );
        setMessage((prevMessage) => [
          ...prevMessage,
          // `Uploaded the file successfully: ${file.name}`,
          String().concat(t('indoor:Uploaded the file successfully'), ': ', `${file.name}`),
        ]);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
        const uploadedFile: UploadedFileType = result?.data;

        // eslint-disable-next-line no-underscore-dangle
        setImageId(uploadedFile.fileInfo._id);
        // eslint-disable-next-line no-underscore-dangle
        onClose(uploadedFile.fileInfo._id);
      } catch {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        progressInfosLocal[idx].percentage = 0;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        setProgressInfos({ val: progressInfosLocal });
        setMessage((prevMessage_1) => [
          ...prevMessage_1,
          // `Could not upload the file: ${file.name}`,
          String().concat(t('indoor:Could not upload the file'), ': ', `${file.name}`),
        ]);
        // onClose('');
      }
    },
    [AccessToken, groupId, onClose, t],
  );

  const uploadFiles = useCallback(() => {
    const files: File[] = selectedFiles != null ? Array.from(selectedFiles) : [];

    const progressInfosLocal = files.map((file: File) => ({
      percentage: 0,
      fileName: file.name,
    }));

    // progressInfosRef.current = {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
    (progressInfosRef as any).current = {
      val: progressInfosLocal,
    };

    // const uploadPromises = files.map((file: File, i: number) => upload(i, file));
    files.map((file: File, i: number) => upload(i, file));

    setMessage([]);
  }, [selectedFiles, upload]);

  const dialogOnClose = useCallback(() => {
    onClose(newImageId);
  }, [newImageId, onClose]);

  useEffect(() => {
    setProgressInfos({ val: [] });
    setMessage([]);
    setImageId('');
  }, [open]);

  useEffect(() => {
    if (progressInfos && progressInfos.val.length > 0) {
      setOpen(!(progressInfos.val[0].percentage === 100));
    }
  }, [progressInfos, setOpen]);

  useEffect(() => {
    if (selectedFiles !== undefined && selectedFiles !== null && selectedFiles?.length > 0) {
      if (selectedFiles[0] !== null) {
        uploadFiles();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFiles]);

  const selectFiles: React.ChangeEventHandler<HTMLInputElement> = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setSelectedFiles(event.target.files);
    setProgressInfos({ val: [] });
  };

  return (
    <I18nMapProvider>
      <BaseDialog
        open={open}
        // onClose={handleCloseDialog}
        onClose={() => {
          dialogOnClose();
        }}
        title={t('indoor:Select FloorPlan File to Upload')}
        classes={{ dialog: classes.dialog, content: classes.dialogContent }}
        content={
          <>
            <Typography variant="body1" className={classes.bodyContainer}>
              {t(
                'indoor:File formats accepted are jpg or png. It will replace the current floorplan_',
              )}
            </Typography>

            <Button
              variant="contained"
              size="small"
              color="primary"
              component="label"
              className={classes.dialogButton}
            >
              {/*  */ t('indoor:Browse')}
              <input
                type="file"
                onChange={selectFiles}
                hidden
                onClick={(e) => {
                  (e.target as HTMLInputElement).value = '';
                }}
              />
            </Button>

            {message.length > 0 && (
              <div className="alert alert-secondary" role="alert">
                <ul>
                  {message.map((item, i) => (
                    <li key={i.toString()}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {progressInfos &&
              progressInfos.val.length > 0 &&
              progressInfos.val.map((progressInfo, _index: number) => (
                <>
                  <LinearProgressWithLabel value={progressInfo.percentage || 0} />
                </>
              ))}
          </>
        }
      />
    </I18nMapProvider>
  );
};

export default React.memo(FileSelector);
