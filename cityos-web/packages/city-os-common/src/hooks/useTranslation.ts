import {
  Namespace,
  Normalize,
  NormalizeMulti,
  TFuncReturn,
  UseTranslationOptions,
  useTranslation as rawUseTranslation,
} from 'react-i18next';
import { StringMap, TFunctionResult, TOptions, i18n } from 'i18next';

export type TFuncKey<N extends Namespace, T> = N extends (keyof T)[]
  ? NormalizeMulti<T, N[number]>
  : N extends keyof T
  ? Normalize<T[N]>
  : string;

export interface TFunction<N extends Namespace, T> {
  <
    TKeys extends TFuncKey<N, T> | TemplateStringsArray extends infer A ? A : never,
    TDefaultResult extends TFunctionResult = string,
    TInterpolationMap extends Record<string, unknown> = StringMap
  >(
    key: TKeys | TKeys[],
    options?: TOptions<TInterpolationMap> | string,
  ): TFuncReturn<N, TKeys, TDefaultResult>;
  <
    TKeys extends TFuncKey<N, T> | TemplateStringsArray extends infer A ? A : never,
    TDefaultResult extends TFunctionResult = string,
    TInterpolationMap extends Record<string, unknown> = StringMap
  >(
    key: TKeys | TKeys[],
    defaultValue?: string,
    options?: TOptions<TInterpolationMap> | string,
  ): TFuncReturn<N, TKeys, TDefaultResult>;
}

export type UseTranslationResponse<N extends Namespace, T> = [TFunction<N, T>, i18n, boolean] & {
  t: TFunction<N, T>;
  i18n: i18n;
  ready: boolean;
};

export default function useTranslation<N extends Namespace, T>(
  ns?: N,
  options?: UseTranslationOptions,
): UseTranslationResponse<N, T> {
  return rawUseTranslation(ns, options);
}
