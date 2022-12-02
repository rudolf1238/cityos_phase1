import { makeStyles } from '@material-ui/core/styles';
import { useLazyQuery, useMutation } from '@apollo/client';

import React, {
  VoidFunctionComponent,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';

import AddIcon from '@material-ui/icons/Add';
import Button from '@material-ui/core/Button';
import CloseIcon from '@material-ui/icons/Close';
import InputAdornment from '@material-ui/core/InputAdornment';
import MenuItem from '@material-ui/core/MenuItem';
import Skeleton from '@material-ui/lab/Skeleton';
import TextField from '@material-ui/core/TextField';

import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Map as LeafletMapClass } from 'leaflet';
import debounce from 'lodash/debounce';
import update from 'immutability-helper';

import { DeviceType, IDevice, Language, Subject } from 'city-os-common/libs/schema';
import { useStore } from 'city-os-common/reducers';
import ReducerActionType from 'city-os-common/reducers/actions';
import ThemeIconButton from 'city-os-common/modules/ThemeIconButton';
import subjectRoutes from 'city-os-common/libs/subjectRoutes';
import uploadImgWithSize, { UploadImgWithSize } from 'city-os-common/api/uploadImgWithSize';

import { Building, Floor, Query } from '../../libs/type';
import { GET_GPS, GetGPSPayload, GetGPSResponse } from '../../api/getGPS';
import {
  GPSPointInput,
  UPDATE_BUILDING,
  UpdateBuildingPayload,
  UpdateBuildingResponse,
} from '../../api/updateBuilding';
import { getAttrByKey } from '../../libs/utils';
import useIndoorTranslation from '../../hooks/useIndoorTranslation';

import { useViewerPageContext } from '../ViewerPageProvider';
import DialogProvider, { DialogContextValue, Uploading } from './DialogProvider';
import FixBaseDialog from '../custom/FixBaseDialog';
import InputSymbolIcon from '../../assets/icon/input-symbol.svg';
import SelectField from '../common/SelectField';
import ThemeLinearProgress from '../custom/ThemeLinearProgress';
import UploadedFloorCard from '../common/UploadedFloorCard';

const useStyles = makeStyles((theme) => ({
  content: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    height: '100%',
  },

  container: {
    width: '100%',
    display: 'flex',
    flex: 1,
    minHeight: 0,
    flexDirection: 'row',
    height: '100%',
    gap: theme.spacing(3),
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
  },

  halfContainer: {
    width: '50%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(3),
    position: 'relative',
  },

  halfContainerTitle: {
    height: theme.spacing(4),
    borderBottom:
      theme.palette.type === 'dark'
        ? '1px solid rgba(255, 255, 255, 0.12)'
        : '1px solid rgba(0, 0, 0, 0.12)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    color: theme.palette.info.main,
    fontSize: theme.spacing(1.75),
    fontWeight: 'bold',
    paddingLeft: 14,
    flexShrink: 0,
  },

  shortInput: {
    width: '50%',
  },

  footer: {
    display: 'flex',
    width: '100%',
    height: 55,
    marginTop: theme.spacing(5),
    alignItems: 'center',
    justifyContent: 'center',
  },

  footerButton: {
    height: 55,
    padding: '20px 76px',
  },

  map: {
    flexGrow: 1,
    width: '100%',
    position: 'relative',
    marginTop: -theme.spacing(2),
    minHeight: 250,
  },

  mapSkeleton: {
    width: '100%',
    height: '100%',
  },

  iconBtn: {
    backgroundColor: 'unset',
    border: 'unset',
    width: theme.spacing(6),
    height: theme.spacing(6),
    color: 'unset',
    '&:hover': {
      backgroundColor: `${theme.palette.action.selected}80`,
      border: 'unset',
    },
    boxShadow: 'unset',
    marginRight: -theme.spacing(1),
  },

  cardContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: theme.spacing(1),
    backgroundColor: theme.palette.type === 'dark' ? '#121a38' : 'rgba(0, 0, 0, 0.05)',
    borderBottom: `1px solid ${
      theme.palette.type === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'
    }`,
    padding: theme.spacing(3, 1, 3, 1),
    overflowX: 'hidden',
    height: '100%',
    marginTop: -theme.spacing(3),
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

  uploadBtn: {
    position: 'absolute',
    right: 14,
    bottom: -28,
  },
}));

interface EditBuildingDialogProps {
  open: boolean;
  styles?: { root?: string; content?: string };
  onClose: (flag?: boolean) => void;
}

const emptyBuilding: Building = {
  id: '',
  deviceId: '',
  name: '',
  desc: null,
  uri: '',
  type: DeviceType.BUILDING,
  location: { lat: 25.032347285245212, lng: 121.52486085957209 },
  sensors: null,
  groups: [],
  status: null,
  attributes: null,
  floors: [],
  timezone: null,
  address: [],
};

const EditBuildingDialog: VoidFunctionComponent<EditBuildingDialogProps> = ({
  open,
  styles,
  onClose,
}: EditBuildingDialogProps) => {
  const classes = useStyles();
  const { t } = useIndoorTranslation(['indoor', 'common']);
  const router = useRouter();
  // const changeRoute = useChangeRoute<Query>(`${subjectRoutes[Subject.INDOOR]}/detail/editor`);
  const routerQuery: Query = useMemo(() => router.query, [router.query]);
  const {
    dispatch,
    user,
    userProfile: { permissionGroup, profile: userProfile },
  } = useStore();

  const [building, setBuilding] = useState<Building | null>(emptyBuilding);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [map, setMap] = useState<LeafletMapClass | null>(null);
  const [address, setAddress] = useState<string>('');
  const [uploadingList, setUploadingList] = useState<Uploading[]>([]);

  const { building: viewerBuilding, setBuilding: setViewerBuilding } = useViewerPageContext();

  const [buildingType, setBuildingType] = useState<string | null>(null);

  useEffect(() => {
    setBuilding(viewerBuilding);
  }, [viewerBuilding]);

  // XXX: 誰叫後端 API 要我自己去裝置屬性撈樓宇型別，超級神奇的 API 呀
  useEffect(() => {
    if (building?.attributes) {
      const currentBuildingType = getAttrByKey(building.attributes, 'building_type');
      if (currentBuildingType) {
        setBuildingType(currentBuildingType.value);
      }
    }
  }, [building?.attributes]);

  // eslint-disable-next-line consistent-return
  const defaultAddress = useMemo<string | null | undefined>(() => {
    const langTag = userProfile?.language === Language.en_US ? 'en' : 'zh-tw'; // TODO: 要問 noodoe 當時設計怎麼會讓後端跟前端的語言代號不一樣

    if (building?.address) {
      if (building?.address.length > 0) {
        const langIndex = building?.address.map((item) => item.language).indexOf(langTag);
        return building?.address[langIndex === -1 ? 0 : langIndex].detail?.formattedAddress;
      }
    }
  }, [building?.address, userProfile?.language]);

  const contextValue = useMemo<DialogContextValue>(
    () => ({
      building,
      setBuilding,
      activeStep,
      setActiveStep,
      map,
      setMap,
      address,
      setAddress,
      uploadingList,
      setUploadingList,
    }),
    [building, activeStep, map, address, uploadingList],
  );

  const [getGPS, { data: getGPSData }] = useLazyQuery<GetGPSResponse, GetGPSPayload>(GET_GPS);

  const handleFindLocation = useCallback(() => {
    if (map && building && getGPSData) {
      map.setView([getGPSData.getLatLonByAddress.lat, getGPSData.getLatLonByAddress.lng]);
      setBuilding(
        update(building, {
          location: {
            $set: {
              lat: getGPSData?.getLatLonByAddress.lat || 0,
              lng: getGPSData?.getLatLonByAddress.lng || 0,
            },
          },
        }),
      );
    }
  }, [building, getGPSData, map, setBuilding]);

  const uploadingListRef = useRef<typeof uploadingList | null>(null);
  const buildingRef = useRef<typeof building | null>(null);

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
          // if (D_DEBUG) console.info(tmpUploading);
          return tmpUploading;
        });
        const newUploadingList = update(uploadingList, { $push: tmpUploadingList });
        setUploadingList(newUploadingList);
        uploadingListRef.current = newUploadingList;
        buildingRef.current = building;
        // if (D_DEBUG) console.info(newUploadingList);
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
    [building, permissionGroup?.group?.id, uploadingList, user.accessToken],
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

  const [updateBuilding] = useMutation<UpdateBuildingResponse, UpdateBuildingPayload>(
    UPDATE_BUILDING,
    {
      onCompleted: (data) => {
        if (data.updateBuilding) {
          void router.push({
            pathname: `${subjectRoutes[Subject.INDOOR]}/detail`,
            query: {
              deviceId: routerQuery.deviceId,
            },
          });
          setViewerBuilding(building);
          onClose(true);
        } else {
          dispatch({
            type: ReducerActionType.ShowSnackbar,
            payload: {
              severity: 'error',
              message: 'Update building error',
            },
          });
        }
      },
      onError: (error) => {
        dispatch({
          type: ReducerActionType.ShowSnackbar,
          payload: {
            severity: 'error',
            message: 'Update building error',
          },
        });
        if (D_DEBUG) {
          console.error(error);
        }
      },
    },
  );

  // TODO: 需要後端支援樓層 tag 是文字
  const handleSaveBuilding = useCallback(async () => {
    const floorInput = (building?.floors || []).map((f: Floor) => ({
      id: f.id,
      name: f.name,
      floorNum: f.floorNum,
      imageLeftTop: f.imageLeftTop,
      imageRightBottom: f.imageRightBottom,
      devices: f.devices.map((d: IDevice) => d.id),
    }));

    const attributesIndexOfBuildingType =
      building?.attributes?.findIndex((attribute) => attribute.key === 'building_type') || -1;
    const currentBuildingType =
      attributesIndexOfBuildingType !== -1
        ? building?.attributes?.[attributesIndexOfBuildingType].value
        : undefined;

    await updateBuilding({
      variables: {
        deviceId: routerQuery.deviceId || '',
        groupId: permissionGroup?.group.id || '',
        buildingInput: {
          name: building?.name || '',
          desc: building?.desc || '',
          floors: floorInput || [],
          location: {
            lat: building?.location?.lat || 0,
            lng: building?.location?.lng || 0,
          } as GPSPointInput,
          buildingType: currentBuildingType,
        },
      },
    });
  }, [
    building?.attributes,
    building?.desc,
    building?.floors,
    building?.location?.lat,
    building?.location?.lng,
    building?.name,
    permissionGroup?.group.id,
    routerQuery.deviceId,
    updateBuilding,
  ]);

  const debounceSetBuildingName = useMemo(
    () =>
      debounce((name: string) => {
        setBuilding(update(building, { name: { $set: name } }));
      }, 500),
    [building, setBuilding],
  );

  const debounceSetBuildingDescription = useMemo(
    () =>
      debounce((desc: string) => {
        setBuilding(update(building, { desc: { $set: desc } }));
      }, 500),
    [building, setBuilding],
  );

  const debounceSetBuildingType = useMemo(
    () =>
      debounce((ibuildingType: string) => {
        if (D_DEBUG) console.info(ibuildingType);
        if (building?.attributes) {
          const currentAttributesIndex = building?.attributes.findIndex(
            (attribute) => attribute.key === 'building_type',
          );
          if (currentAttributesIndex > -1) {
            setBuilding(
              update(building, {
                attributes: {
                  [currentAttributesIndex]: {
                    value: { $set: ibuildingType },
                  },
                },
              }),
            );
          } else {
            setBuilding(
              update(building, {
                attributes: {
                  $push: [
                    {
                      key: 'building_type',
                      value: ibuildingType,
                    },
                  ],
                },
              }),
            );
          }
        } else {
          setBuilding(
            update(building, {
              attributes: { $set: [{ key: 'building_type', value: ibuildingType }] },
            }),
          );
        }
      }, 500),
    [building, setBuilding],
  );

  const debounceSetAddress = useMemo(
    () =>
      debounce((a: string) => {
        void getGPS({ variables: { address: a } });
        setAddress(a);
      }, 500),
    [getGPS, setAddress],
  );

  const debounceSetFloorNum = useMemo(
    () =>
      debounce((index: number, floorNum: number) => {
        setBuilding(update(building, { floors: { [index]: { floorNum: { $set: floorNum } } } }));
      }, 500),
    [building, setBuilding],
  );

  const debounceSetFloorName = useMemo(
    () =>
      debounce((index: number, floorName: string) => {
        setBuilding(update(building, { floors: { [index]: { name: { $set: floorName } } } }));
      }, 500),
    [building, setBuilding],
  );

  const LoadingMap = useMemo(
    () => <Skeleton variant="rect" className={classes.mapSkeleton} />,
    [classes.mapSkeleton],
  );

  const LatLngMap = useMemo(
    () =>
      dynamic(() => import('./special/LatLngMap'), {
        loading: () => LoadingMap,
        ssr: false,
      }),
    [LoadingMap],
  );

  const moveCard = useCallback(
    (dragIndex: number, hoverIndex: number) => {
      if (buildingRef.current === null) buildingRef.current = building;
      buildingRef.current = update(buildingRef.current, {
        floors: {
          $splice: [
            [dragIndex, 1],
            [hoverIndex, 0, building?.floors[dragIndex] as Floor],
          ],
        },
      });
      setBuilding(buildingRef.current);
    },
    [building],
  );

  return (
    <DialogProvider value={contextValue}>
      <FixBaseDialog
        open={open}
        onClose={() => onClose(false)}
        title={t('indoor:Edit Building Info')}
        classes={{ dialog: styles?.root, content: styles?.content }}
        titleAlign="center"
        content={
          <div className={classes.content}>
            <div className={classes.container}>
              <div className={classes.halfContainer} style={{ overflowY: 'auto' }}>
                <div className={classes.halfContainerTitle}>{t('indoor:Basic info')}</div>
                <TextField
                  label={t('indoor:Building')}
                  placeholder={t('indoor:Insert building name')}
                  variant="outlined"
                  defaultValue={building?.name}
                  onChange={(e) => debounceSetBuildingName(e.target.value)}
                  required
                />
                <TextField
                  label={t('indoor:Description')}
                  placeholder={t('indoor:Insert description')}
                  variant="outlined"
                  defaultValue={building?.desc}
                  onChange={(e) => debounceSetBuildingDescription(e.target.value)}
                />
                {buildingType && (
                  <SelectField
                    label={t('indoor:Building Type')}
                    styles={classes.shortInput}
                    defaultValue={buildingType}
                    onChange={(e) => debounceSetBuildingType(e.target.value)}
                  >
                    <MenuItem key="office" value="office">
                      {t('indoor:Office')}
                    </MenuItem>
                    <MenuItem key="hotel" value="hotel">
                      {t('indoor:Hotel')}
                    </MenuItem>
                    <MenuItem key="business" value="business">
                      {t('indoor:Business')}
                    </MenuItem>
                  </SelectField>
                )}
                <TextField
                  label={t('indoor:Address')}
                  variant="outlined"
                  defaultValue={defaultAddress}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <ThemeIconButton
                          classes={{
                            root: classes.iconBtn,
                          }}
                          onClick={() => handleFindLocation()}
                        >
                          <InputSymbolIcon />
                        </ThemeIconButton>
                      </InputAdornment>
                    ),
                  }}
                  onChange={(e) => debounceSetAddress(e.target.value)}
                />
                <div className={classes.halfContainerTitle}>{t('indoor:Location')}</div>
                <div className={classes.map}>
                  <LatLngMap radius />
                </div>
              </div>
              <div className={classes.halfContainer}>
                <div className={classes.halfContainerTitle}>{t('indoor:Floor')}</div>
                <div className={classes.cardContainer}>
                  <DndProvider backend={HTML5Backend}>
                    {building &&
                      building.floors.map((floor: Floor, index: number) => (
                        <UploadedFloorCard
                          key={floor.id}
                          floor={floor}
                          index={index}
                          debounceSetFloorNum={debounceSetFloorNum}
                          debounceSetFloorName={debounceSetFloorName}
                          moveCard={moveCard}
                        />
                        // NOTE: 保留舊有的寫法，因為不知道會不會最後放棄拖曳的功能 [Fishcan @ 2022-07-31]
                        // <div className={classes.uploadedCard} key={floor.id}>
                        //   <Img id={floor.id} className={classes.uploadedCardImage} />
                        //   <TextField
                        //     className={classes.uploadedCardFloorNumberInput}
                        //     variant="outlined"
                        //     inputProps={{
                        //       inputMode: 'numeric',
                        //       pattern: '[0-9]*',
                        //       style: { textAlign: 'center' },
                        //     }}
                        //     defaultValue={floor.floorNum}
                        //     onChange={(e) => {
                        //       debounceSetFloorNum(index, Number(e.target.value || '0') || 0);
                        //     }}
                        //   />
                        //   <TextField
                        //     className={classes.uploadedCardFloorNameInput}
                        //     variant="outlined"
                        //     defaultValue={floor.name}
                        //     onChange={(e) => {
                        //       debounceSetFloorName(index, e.target.value);
                        //     }}
                        //   />
                        // </div>
                      ))}
                  </DndProvider>
                  {uploadingList.map((uploading: Uploading) => (
                    <div className={classes.uploadingCard} key={uploading.id}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={uploading.url} alt="" className={classes.uploadingCardImage} />
                      <div className={classes.uploadingCardContent}>
                        <div className={classes.uploadingCardContentBody}>
                          <span
                            style={{ maxWidth: '180px', overflow: 'hidden', whiteSpace: 'nowrap' }}
                          >
                            {uploading.fileName}
                          </span>
                          <span>{Math.round((uploading.size / 1024 / 1024) * 10) / 10} MiB</span>
                        </div>
                        <div className={classes.uploadingCardContentFooter}>
                          <ThemeLinearProgress variant="determinate" value={uploading.progress} />
                        </div>
                      </div>
                      <ThemeIconButton
                        aria-label={t('common:Delete')}
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
                  <div className={classes.uploadBtn}>
                    <ThemeIconButton aria-label={t('common:Delete')} isLabel>
                      <AddIcon />
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
                    </ThemeIconButton>
                  </div>
                </div>
              </div>
            </div>

            <div className={classes.footer}>
              <Button
                variant="contained"
                color="primary"
                size="medium"
                className={classes.footerButton}
                onClick={() => {
                  void handleSaveBuilding();
                }}
                disabled={!building?.name || !building?.floors.length}
              >
                {t('common:Save')}
              </Button>
            </div>
          </div>
        }
      />
    </DialogProvider>
  );
};

export default memo(EditBuildingDialog);
