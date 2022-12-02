import { makeStyles } from '@material-ui/core/styles';
import React, { VoidFunctionComponent, memo, useCallback, useState } from 'react';
import dynamic from 'next/dynamic';

import { Action, RecognitionType, Subject } from 'city-os-common/libs/schema';

import Guard from 'city-os-common/modules/Guard';
import Header from 'city-os-common/modules/Header';
import MainLayout from 'city-os-common/modules/MainLayout';
import PageContainer from 'city-os-common/modules/PageContainer';

import { FiltersData } from '../libs/type';
import useEventsTranslation from '../hooks/useEventsTranslation';

import BasicTable from './EventsTables/BasicTable';
import Filters, { defaultFilters } from './Filters';
import FlowChartTable from './FlowChartTable';
import I18nEventsProvider from './I18nEventsProvider';
import RecognitionTable from './EventsTables/RecognitionTable';

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
  },

  tableWrapper: {
    textAlign: 'center',
  },
}));

const MapPreviewer = dynamic(() => import('./MapPreviewer'), {
  ssr: false,
});

const Events: VoidFunctionComponent = () => {
  const classes = useStyles();
  const { t } = useEventsTranslation('mainLayout');

  const [filtersData, setFiltersData] = useState<FiltersData>(defaultFilters);
  const [previewDeviceId, setPreviewDeviceId] = useState<string>();

  const onChange = useCallback((data: FiltersData) => {
    setFiltersData(data);
  }, []);

  const tableType = filtersData.recognitionType;

  return (
    <I18nEventsProvider>
      <MainLayout>
        <Guard subject={Subject.IVS_EVENTS} action={Action.VIEW}>
          <PageContainer>
            <Header title={t('Events')} />
            <div className={classes.container}>
              <Filters initValues={filtersData} onChange={onChange} />
              <div>{/* TODO: Diagrams */}</div>
              <div className={classes.tableWrapper}>
                {!tableType && (
                  <BasicTable filtersData={filtersData} setPreviewDeviceId={setPreviewDeviceId} />
                )}
                {(tableType === RecognitionType.CAR_FLOW ||
                  tableType === RecognitionType.HUMAN_FLOW) && (
                  <FlowChartTable filtersData={filtersData} />
                )}
                {(tableType === RecognitionType.CAR_IDENTIFY ||
                  tableType === RecognitionType.HUMAN_SHAPE ||
                  tableType === RecognitionType.HUMAN_FLOW_ADVANCE) && (
                  <RecognitionTable
                    filtersData={filtersData}
                    setPreviewDeviceId={setPreviewDeviceId}
                  />
                )}
              </div>
              {previewDeviceId && (
                <MapPreviewer
                  deviceId={previewDeviceId}
                  onClose={() => {
                    setPreviewDeviceId(undefined);
                  }}
                />
              )}
            </div>
          </PageContainer>
        </Guard>
      </MainLayout>
    </I18nEventsProvider>
  );
};

export default memo(Events);
