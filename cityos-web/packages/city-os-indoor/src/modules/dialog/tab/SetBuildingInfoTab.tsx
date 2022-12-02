import { makeStyles } from '@material-ui/core/styles';

import React, { VoidFunctionComponent, memo, useCallback, useMemo } from 'react';

import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';

import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import clsx from 'clsx';
import debounce from 'lodash/debounce';
import update from 'immutability-helper';

import { Subject } from 'city-os-common/libs/schema';
import DivisionSelector from 'city-os-common/modules/DivisionSelector';
import subjectRoutes from 'city-os-common/libs/subjectRoutes';
import useChangeRoute from 'city-os-common/hooks/useChangeRoute';

import { Floor, Query } from '../../../libs/type';
import { getAttrByKey } from '../../../libs/utils';
import useIndoorTranslation from '../../../hooks/useIndoorTranslation';

import { useDialogContext } from '../DialogProvider';
// import Img from '../../common/Img'; 舊的圖片元件是用 img tag 實現的
import SelectField from '../../common/SelectField';
import UploadedFloorCard from '../../common/UploadedFloorCard';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'row',
    height: '100%',
    width: '100%',
    padding: theme.spacing(3, 5.5, 0, 5.5),
    gap: theme.spacing(3),
  },

  halfContainer: {
    width: '50%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
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

  halfContainerBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(3),
    overflowY: 'auto',
    paddingTop: theme.spacing(3),
    // maxHeight: `calc(95vh - ${theme.spacing(29)}px - 91.2px)`,
  },

  cardContainer: {
    gap: theme.spacing(1),
    backgroundColor: theme.palette.type === 'dark' ? '#121a38' : 'rgba(0, 0, 0, 0.05)',
    borderBottom: `1px solid ${
      theme.palette.type === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'
    }`,
    padding: theme.spacing(3, 1, 3, 1),
    overflowX: 'hidden',
    height: '100%',
  },

  shortInput: {
    width: '50%',
  },

  // 沒有拖曳功能的卡片樣式 Fishcan @ 2022-08-02
  // uploadedCard: {
  //   display: 'flex',
  //   flexDirection: 'row',
  //   width: theme.spacing(55),
  //   height: theme.spacing(13.25),
  //   borderRadius: theme.spacing(1),
  //   border:
  //     theme.palette.type === 'dark'
  //       ? 'solid 1px rgba(255, 255, 255, 0.12)'
  //       : 'solid 1px rgba(0, 0, 0, 0.12)',
  //   alignItems: 'center',
  //   justifyContent: 'space-between',
  //   padding: theme.spacing(1.25, 2, 1.875, 1),
  //   flexShrink: 0,
  //   backgroundColor: theme.palette.background.oddRow,
  //   '&:hover': {
  //     backgroundColor: theme.palette.background.evenRow,
  //   },
  //   gap: theme.spacing(2),
  // },
  // uploadedCardImage: {
  //   width: theme.spacing(9),
  //   height: theme.spacing(9),
  //   borderRadius: theme.spacing(1),
  //   boxShadow: `${theme.spacing(0, 0.125, 0.5, 0)} rgba(184, 197, 211, 0.25)`,
  // },
  // uploadedCardFloorNumberInput: {
  //   width: theme.spacing(7),
  // },
  // uploadedCardFloorNameInput: {
  //   flexGrow: 1,
  // },
}));

const SetBuildingInfoTab: VoidFunctionComponent = () => {
  const classes = useStyles();
  const { t } = useIndoorTranslation(['indoor', 'common']);
  const changeRoute = useChangeRoute<Query>(subjectRoutes[Subject.INDOOR]);

  const { address, building, setBuilding } = useDialogContext();

  const buildingType: string = useMemo(() => {
    let res = 'office';
    if (building?.attributes) {
      const currentBuildingType = getAttrByKey(building.attributes, 'building_type');
      if (currentBuildingType) {
        res = currentBuildingType.value;
      }
    }
    return res;
  }, [building?.attributes]);

  const handleGroupChange = useCallback(
    (selectedId: string) => {
      changeRoute({ gid: selectedId });
    },
    [changeRoute],
  );

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

  const moveCard = useCallback(
    (dragIndex: number, hoverIndex: number) => {
      setBuilding(
        update(building, {
          floors: {
            $splice: [
              [dragIndex, 1],
              [hoverIndex, 0, building?.floors[dragIndex] as Floor],
            ],
          },
        }),
      );
    },
    [building, setBuilding],
  );

  return (
    <div className={classes.root}>
      <div className={classes.halfContainer}>
        <div className={classes.halfContainerTitle}>{t('indoor:Basic info')}</div>
        <div className={classes.halfContainerBody}>
          <DivisionSelector label={t('common:Division')} onChange={handleGroupChange} />
          <TextField
            label={t('indoor:Building Name')}
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
          <TextField
            label={t('indoor:Address')}
            variant="outlined"
            defaultValue={address || ' '}
            disabled
          />
        </div>
      </div>
      <div className={classes.halfContainer}>
        <div className={classes.halfContainerTitle}>{t('indoor:Floor_plural')}</div>
        <div className={clsx(classes.halfContainerBody, classes.cardContainer)}>
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
                // 舊版沒有拖曳功能的卡片 Fishcan @ 2022-08-02
                // <div className={classes.uploadedCard}>
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
        </div>
      </div>
    </div>
  );
};

export default memo(SetBuildingInfoTab);
