import {
  AgeGroup,
  CameraEventSortField,
  RecognitionType,
  ageGroup,
} from 'city-os-common/libs/schema';

import { CarModel, Color } from './type';

export const isRecognitionType = (value: unknown): value is RecognitionType =>
  Object.values<unknown>(RecognitionType).includes(value);

export const isCameraEventSortField = (value: unknown): value is CameraEventSortField =>
  Object.values<unknown>(CameraEventSortField).includes(value);

export const isCarModel = (value: unknown): value is CarModel =>
  Object.values<unknown>(CarModel).includes(value);

export const isColor = (value: unknown): value is Color =>
  Object.values<unknown>(Color).includes(value);

export const isAgeGroup = (value: unknown): value is AgeGroup =>
  Object.values<unknown>(ageGroup).includes(value);
