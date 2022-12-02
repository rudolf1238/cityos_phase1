import { makeStyles } from '@material-ui/core/styles';

import React, { VoidFunctionComponent, memo, useCallback, useRef } from 'react';

import Button from '@material-ui/core/Button';
import CloseIcon from '@material-ui/icons/Close';

import update from 'immutability-helper';

import { useStore } from 'city-os-common/reducers';
import ThemeIconButton from 'city-os-common/modules/ThemeIconButton';
import uploadImgWithSize, { UploadImgWithSize } from 'city-os-common/api/uploadImgWithSize';

import { Floor } from '../../../libs/type';
import useIndoorTranslation from '../../../hooks/useIndoorTranslation';

import { Uploading, useDialogContext } from '../DialogProvider';
import Img from '../../common/Img';
import ThemeLinearProgress from '../../custom/ThemeLinearProgress';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    height: '100%',
    width: '100%',
  },

  header: {
    display: 'flex',
    flexDirection: 'row',
    width: theme.spacing(62),
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: theme.spacing(3),
  },

  headerTitle: {
    color: theme.palette.type === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
    fontSize: theme.spacing(2.5),
  },

  headerButton: {
    height: theme.spacing(6.875),
    padding: '20px 74px',
  },

  body: {
    // flex: '1 0 auto',
    width: theme.spacing(62),
    marginTop: theme.spacing(3),
    backgroundColor: theme.palette.type === 'dark' ? '#121a38' : 'rgba(0, 0, 0, 0.05)',
    borderTop: `1px solid ${
      theme.palette.type === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'
    }`,
    borderBottom: `1px solid ${
      theme.palette.type === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'
    }`,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: theme.spacing(1),
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    minHeight: 0,
    overflowX: 'hidden',
    overflowY: 'auto',
    flexGrow: 1,
    // maxHeight: `calc(95vh - ${theme.spacing(33.875)}px - 125px)`,
  },

  uploadingCard: {
    display: 'flex',
    flexDirection: 'row',
    width: theme.spacing(55),
    height: theme.spacing(13.25),
    borderRadius: theme.spacing(1),
    border:
      theme.palette.type === 'dark'
        ? 'solid 1px rgba(255, 255, 255, 0.12)'
        : 'solid 1px rgba(0, 0, 0, 0.12)',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing(1.25, 1, 1.875, 1),
    flexShrink: 0,
    backgroundColor: theme.palette.background.oddRow,
    '&:hover': {
      backgroundColor: theme.palette.background.evenRow,
    },
    gap: theme.spacing(3),
  },

  uploadingCardImage: {
    width: theme.spacing(9),
    height: theme.spacing(9),
    borderRadius: theme.spacing(1),
    boxShadow: `${theme.spacing(0, 0.125, 0.5, 0)} rgba(184, 197, 211, 0.25)`,
  },

  uploadingCardIconBtn: {
    backgroundColor: 'unset',
    color: theme.palette.primary.main,
    border: 'unset',
    width: theme.spacing(5),
    height: theme.spacing(5),
    '&:hover': {
      backgroundColor: `${theme.palette.action.selected}80`,
      border: 'unset',
    },
    boxShadow: 'unset',
  },

  uploadingCardContent: {
    height: '100%',
    display: 'flex',
    flexGrow: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: theme.spacing(4, 0, 1.25, 0),
    marginRight: -theme.spacing(2),
  },

  uploadingCardContentBody: {
    overflow: 'hidden',
    display: 'flex',
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: '16px',
    color: theme.palette.type === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
    '&>span:last-child': {
      color: theme.palette.type === 'dark' ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)',
    },
    paddingLeft: theme.spacing(0.5),
  },

  uploadingCardContentFooter: {},
}));

const UploadFloorplanFilesTab: VoidFunctionComponent = () => {
  const classes = useStyles();

  const { t } = useIndoorTranslation(['indoor']);

  const { building, setBuilding, uploadingList, setUploadingList } = useDialogContext();

  const uploadingListRef = useRef<typeof uploadingList | null>(null);
  const buildingRef = useRef<typeof building | null>(null);

  const {
    user,
    userProfile: { permissionGroup },
  } = useStore();

  const handleSelectFiles: React.FormEventHandler<HTMLInputElement> = useCallback(
    (event: React.FormEvent<HTMLInputElement>) => {
      const { files } = event.currentTarget;
      if (files) {
        const tmpUploadingList = Array.from(files).map((file: File) => {
          const time = new Date().getTime();
          const tmpUploading: Uploading = {
            id: `${time}-${file.name}`,
            time,
            fileName: file.name,
            size: file.size,
            progress: 0,
            file,
            url: URL.createObjectURL(file),
            abortController: new AbortController(),
          };
          // console.info(tmpUploading);
          return tmpUploading;
        });
        const newUploadingList = update(uploadingList, { $push: tmpUploadingList });
        setUploadingList(newUploadingList);
        uploadingListRef.current = newUploadingList;
        buildingRef.current = building;
        // console.info(newUploadingList);
        tmpUploadingList.map((tmpUploading) => {
          void uploadImgWithSize({
            file: tmpUploading.file,
            onUploadProgress: (e: ProgressEvent) => {
              if (uploadingListRef.current) {
                const uploading = uploadingListRef.current.find(
                  (item) => item.id === tmpUploading.id,
                );
                if (uploading) {
                  const index = uploadingListRef.current.indexOf(uploading);
                  if (D_DEBUG) console.info(index);
                  if (index > -1) {
                    uploadingListRef.current = update(uploadingListRef.current, {
                      [index]: { progress: { $set: (e.loaded / e.total) * 100 } },
                    });
                    setUploadingList(uploadingListRef.current);
                  }
                }
              }
            },
            controller: tmpUploading.abortController,
            authorization: `Bearer ${user.accessToken || ''}`,
            groupId: permissionGroup?.group?.id,
          })
            .then(({ httpResponse: res, imageSize }: UploadImgWithSize) => {
              if (D_DEBUG) console.info(res, tmpUploading);
              if (D_DEBUG) console.info('imageSize', imageSize);
              let imageLeft = '1';
              let imageBottom = '1';
              let imageRight = '-1';
              let imageTop = '-1';
              if (imageSize.width > imageSize.height) {
                const ratio = imageSize.width / imageSize.height;
                imageLeft = '-1';
                imageRight = '1';
                imageTop = `${ratio}`;
                imageBottom = `${-ratio}`;
              }
              if (imageSize.width < imageSize.height) {
                const ratio = imageSize.height / imageSize.width;
                imageLeft = `${-ratio}`;
                imageRight = `${ratio}`;
                imageTop = '1';
                imageBottom = '-1';
              }
              const tmpfloor: Floor = {
                // eslint-disable-next-line no-underscore-dangle
                id: res.fileInfo._id,
                name: res.fileInfo.filename,
                floorNum: 0,
                devices: [],
                imageLeftTop: [imageLeft, imageTop],
                imageRightBottom: [imageRight, imageBottom],
              };
              buildingRef.current = update(buildingRef.current, { floors: { $push: [tmpfloor] } });
              setBuilding(buildingRef.current);

              if (uploadingListRef.current) {
                const uploadIndex = uploadingListRef.current.indexOf(tmpUploading);
                uploadingListRef.current = update(uploadingListRef.current, {
                  $splice: [[uploadIndex, 1]],
                });
                setUploadingList(uploadingListRef.current);
              }
            })
            .catch((err) => {
              console.error(err);
            });
          return null;
        });
      }
    },
    [
      building,
      permissionGroup?.group?.id,
      setBuilding,
      setUploadingList,
      uploadingList,
      user.accessToken,
    ],
  );

  const handleCancelUploading = useCallback(
    (uploading: Uploading) => {
      const currentUploadingList = uploadingListRef.current;
      if (currentUploadingList) {
        const index = currentUploadingList.indexOf(uploading);
        if (index > -1) {
          uploading.abortController.abort();
          uploadingListRef.current = update(uploadingList, { $splice: [[index, 1]] });
          setUploadingList(uploadingListRef.current);
        }
      }
    },
    [setUploadingList, uploadingList],
  );

  return (
    <div className={classes.root}>
      <div className={classes.header}>
        <span className={classes.headerTitle}>{t('indoor:Upload Floorplan Files')}</span>
        <Button
          variant="contained"
          color="primary"
          component="label"
          className={classes.headerButton}
        >
          {t('indoor:Browse')}
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
        </Button>
      </div>
      <div className={classes.body}>
        {uploadingList.map((uploading: Uploading) => (
          <div className={classes.uploadingCard}>
            {/* <Img id="621eb96b77a2dd5923cbf58e" className={classes.uploadingCardImage} /> */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={uploading.url} alt="" className={classes.uploadingCardImage} />
            <div className={classes.uploadingCardContent}>
              <div className={classes.uploadingCardContentBody}>
                <span style={{ maxWidth: '180px', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                  {uploading.fileName}
                </span>
                <span>{Math.round((uploading.size / 1024 / 1024) * 10) / 10} MiB</span>
              </div>
              <div className={classes.uploadingCardContentFooter}>
                <ThemeLinearProgress variant="determinate" value={uploading.progress} />
              </div>
            </div>
            <ThemeIconButton
              aria-label="delete"
              classes={{
                root: classes.uploadingCardIconBtn,
              }}
              onClick={() => {
                handleCancelUploading(uploading);
              }}
            >
              <CloseIcon />
            </ThemeIconButton>
          </div>
        ))}
        {building &&
          building.floors.map((floor: Floor) => (
            <div className={classes.uploadingCard}>
              {/* <Img id="621eb96b77a2dd5923cbf58e" className={classes.uploadingCardImage} /> */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <Img id={floor.id} className={classes.uploadingCardImage} />
              <div className={classes.uploadingCardContent}>
                <div className={classes.uploadingCardContentBody}>
                  <span style={{ maxWidth: '180px', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {floor.name}
                  </span>
                </div>
              </div>
              <ThemeIconButton
                aria-label="delete"
                classes={{
                  root: classes.uploadingCardIconBtn,
                }}
                onClick={() => {
                  const floorIndex = building.floors.findIndex((item) => item.id === floor.id);
                  setBuilding(update(building, { floors: { $splice: [[floorIndex, 1]] } }));
                }}
              >
                <CloseIcon />
              </ThemeIconButton>
            </div>
          ))}
      </div>
    </div>
  );
};

export default memo(UploadFloorplanFilesTab);
