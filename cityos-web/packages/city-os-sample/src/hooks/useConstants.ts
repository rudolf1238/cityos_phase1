import { ComponentId, ComponentInfoList } from '../libs/type';
import useSampleTranslation from './useSampleTranslation';

interface UseConstants {
  componentInfoList: ComponentInfoList;
}

const useConstants = (): UseConstants => {
  const { t: tSample } = useSampleTranslation();

  const componentInfoList = [
    {
      id: ComponentId.DIVISION_SELECTOR,
      label: tSample('sample:Division Selector'),
      description: '用於選擇部門的下拉式樹狀單選器',
    },
    {
      id: ComponentId.HEADER,
      label: tSample('sample:Header'),
      description: '用於顯示頁面的標題',
    },
    {
      id: ComponentId.BASE_MAP_CONTAINER,
      label: tSample('sample:Base Map Container'),
      description: '基礎的地圖容器',
    },
  ];

  return { componentInfoList };
};

export default useConstants;
