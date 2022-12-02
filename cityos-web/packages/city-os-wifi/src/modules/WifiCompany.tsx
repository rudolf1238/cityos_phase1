import { makeStyles, styled } from '@material-ui/core/styles';
import { SubmitHandler, useForm, useFormContext } from 'react-hook-form';
import React, { FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react';
import i18n from 'i18next';
import { FetchResult, useMutation, useQuery } from '@apollo/client';
// import { FileUpload } from 'graphql-upload';
import Grid from '@material-ui/core/Grid';
// import { IconButton } from '@material-ui/core';
import { useStore } from 'city-os-common/reducers';
import BaseDialog from 'city-os-common/modules/BaseDialog';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import ReducerActionType from 'city-os-common/reducers/actions';
import useIsMountedRef from 'city-os-common/hooks/useIsMountedRef';
//import linePic from '../assets/icon/line.jpg';

import { FormData, CompanyBasic, CompanyAdvance, DetailFormData } from '../libs/types';
import PreviewIcon from '@mui/icons-material/Preview';
import AddPhotoAlternateIcon from '@material-ui/icons/AddPhotoAlternate';
import NestedTable from 'city-os-common/modules/NestedTable';
import ThemeIconButton from 'city-os-common/modules/ThemeIconButton';
import HighlightOffIcon from '@material-ui/icons/HighlightOff';

import {
  SearchCompanyAdvancePayload,
  SearchCompanyAdvanceResponse,
  SEARCH_COMPANYADVANCE_ON_WIFI,
} from '../api/searchCompanyAdvanceOnWifi';
import { EditCompanyPayload, EditCompanyResponse, EDIT_COMPANY } from '../api/editCompany';
import useWifiTranslation from '../hooks/useWifiTranslation';
import useWebTranslation from '../../../city-os-web/src/hooks/useWebTranslation';
import Switch from '@material-ui/core/Switch';
import FileOpenIcon from '@mui/icons-material/FileOpen';
import uploadImg from '../api/uploadImg';
import axios from 'axios';
import { getItem, getValue, StorageKey } from 'city-os-common/libs/storage';
import { isString } from 'city-os-common/libs/validators';
import * as fs from 'fs/promises';
import { ReadStream } from 'fs-capacitor';
import { AddCompanyPayload, AddCompanyResponse, ADD_COMPANY } from '../api/addCompany';
import { Card, Link, Tooltip } from '@material-ui/core';

const Input = styled('input')({
  display: 'none',
});
const useStyles = makeStyles((theme) => ({
  form: {
    // width: '80vw',
    // minWidth: 550,
    margin: 0,
    width: '100%',
  },

  basicInfo: {
    display: 'flex',
    gap: theme.spacing(2),
    justifyContent: 'center',
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },

  tableContainer: {
    maxHeight: 320,
  },

  imgErr: {
    borderColor: `${theme.palette.error.main}`,
  },

  submitButtonWrapper: {
    display: 'flex',
    justifyContent: 'center',
    paddingTop: theme.spacing(10),
  },

  textField: {
    flex: 1,
    maxWidth: 360,
  },

  subtitle: {
    color: theme.palette.info.main,
    paddingTop: theme.spacing(3),
  },

  imgcenter: {
    display: 'flex',
    justifyContent: 'center',
  },

  imgNullCenter: {
    display: 'flex',
    justifyContent: 'center',
    color: `${theme.palette.error.main}`,
  },

  tooltip: {
    display: 'flex',
    backgroundColor: 'transparent',
    color: theme.palette.text.primary,
    fontSize: theme.typography.subtitle2.fontSize,
    fontWeight: theme.typography.subtitle2.fontWeight,
  },
  type: {
    display: 'flex',
    gap: theme.spacing(1.5),
    alignItems: 'center',
  },

  formControl: {
    margin: theme.spacing(1),
    width: 300,
  },

  paper: {
    padding: theme.spacing(4, 11),
    width: 900,
  },

  toggle: {
    paddingTop: theme.spacing(0.5),
  },

  button: {
    margin: 'auto',
    marginTop: theme.spacing(4.5),
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
    float: 'right',
  },

  uploadingCardImage: {
    width: '70%',
    height: '70%',
    display: 'flex',
    //borderRadius: theme.spacing(1),
    //boxShadow: `${theme.spacing(0, 0.125, 0.5, 0)} rgba(184, 197, 211, 0.25)`,
    paddingTop: theme.spacing(1),
    margin: 'auto',
  },
}));

interface InputProps {
  type: string;
  divisionId: string; //divisionId
  name: string;
  logo?: string;
  line?: string;
  url?: string;
  open: boolean;
  companyId?: string;
  onClose: () => void;
}

const WIFICompany: FunctionComponent<InputProps> = ({
  type,
  divisionId,
  companyId,
  name,
  logo,
  url,
  line,
  open,
  onClose,
}: InputProps) => {
  const { t } = useWifiTranslation(['wifi']);
  const classes = useStyles();
  const {
    handleSubmit,
    register,
    watch,
    reset,
    setValue,
    resetField,
    formState: { dirtyFields, isValid, errors },
  } = useForm<FormData>({
    defaultValues: {
      //data from parent form
      id: divisionId,
      companyId: companyId,
      name: name,
      logo: logo,
      line: line,
      url: url,
      // data from useQuery
      ssid: '',
      serviceIntroduction: '',
      serviceIntroductionEn: '',
      accessTime: parseInt(''),
      dailyAccess: parseInt(''),
      accessLimit: parseInt(''),
      idleTimeout: parseInt(''),
      terms: '',
      termsEn: '',
      privacyTerms: '',
      privacyTermsEn: '',
      downloadSpeed: parseInt(''),
      uploadSpeed: parseInt(''),
      passShowTime: parseInt(''),
    },
    mode: 'onChange',
  });

  //const detailFormMethods = useFormContext<DetailFormData>();
  const {
    dispatch,
    userProfile: { permissionGroup },
  } = useStore();

  const [addCompany, { loading: addCompanyLoading }] = useMutation<
    AddCompanyResponse,
    AddCompanyPayload
  >(ADD_COMPANY);

  const [editCompany, { loading: editCompanyLoading }] = useMutation<
    EditCompanyResponse,
    EditCompanyPayload
  >(EDIT_COMPANY);

  //const [open, setOpen] = useState(false)
  const [editDivisionId, setEditDivisionId] = useState<string>('');
  const [editCompanyId, setEditCompanyId] = useState<string>();
  const [companyName, setcompanyName] = useState<string>();
  const [editLogo, setEditLogo] = useState<string>();
  const [editUrl, setEditUrl] = useState<string>();
  const isMountedRef = useIsMountedRef();
  const [FormData, setFormData] = useState<FormData>();
  const [defaultValues, setDefaultValues] = useState<FormData>({
    id: '',
    companyId: '',
    name: '',
    logo: '',
    url: '',
    ssid: '',
    serviceIntroduction: '',
    serviceIntroductionEn: '',
    accessTime: parseInt(''),
    dailyAccess: parseInt(''),
    accessLimit: parseInt(''),
    idleTimeout: parseInt(''),
    terms: '',
    termsEn: '',
    privacyTerms: '',
    privacyTermsEn: '',
    downloadSpeed: parseInt(''),
    uploadSpeed: parseInt(''),
    passShowTime: 0,
  });
  const [toggle, setToggle] = useState<boolean>(false);
  const groupId = permissionGroup?.group.id;
  const handleOnClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  let fileID = '';
  const refreshToken = getValue(getItem(StorageKey.ACCESS), isString);
  const authorization = `Bearer ${refreshToken || ''}`;

  const [lineUrl, setLineUrl] = React.useState('');
  const [logoUrl, setLogoUrl] = React.useState('');
  //const [logoFile, setLogoFile] = React.useState('');
  const [showTerms, setShowTerms] = React.useState('');
  const [termsEn, setTermsEn] = React.useState('');
  const [privacyTerms, setPrivacyTerms] = React.useState('');
  const [privacyTermsEn, setPrivacyTermsEn] = React.useState('');
  const [companyAdvance, setCompanyAdvance] = useState<CompanyAdvance>();

  function loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      let img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
  }
  const handleOnChangeImage: React.ChangeEventHandler<HTMLInputElement> = async (event) => {
    if (event.currentTarget.files != null) {
      if (event.currentTarget.files.length > 0) {
        const file = event.currentTarget.files[0];

        if (
          !file.type.includes('image/jpg') &&
          !file.type.includes('image/jpeg') &&
          !file.type.includes('image/png') &&
          !file.type.includes('image/gif') &&
          !file.type.includes('image/JPG') &&
          !file.type.includes('image/JPEG') &&
          !file.type.includes('image/PNG') &&
          !file.type.includes('image/GIF') &&
          !file.type.includes('image/gif')
        ) {
          event.target.value = '';
          dispatch({
            type: ReducerActionType.ShowSnackbar,
            payload: {
              severity: 'warning',
              message: t(
                'wifi:Image Type is error. Only image files are allowed! (ex: *.jpg, *png, and *gif)',
              ),
            },
          });
          return;
        }

        const img = await loadImage(URL.createObjectURL(file));
        if (
          (event.target.id === 'logo' && (img.width > 600 || img.height > 77)) ||
          (event.target.id === 'line' && img.height > 16)
        ) {
          event.target.value = '';
          if (event.target.id === 'logo') {
            dispatch({
              type: ReducerActionType.ShowSnackbar,
              payload: {
                severity: 'warning',
                message: t('wifi:Logo_Invalid Image format'),
              },
            });
            return;
          } else {
            dispatch({
              type: ReducerActionType.ShowSnackbar,
              payload: {
                severity: 'warning',
                message: t('wifi:Line_Invalid Image format'),
              },
            });
            return;
          }
        }

        const upload = await uploadImg({ file, authorization, groupId });
        if (!upload) {
          event.target.value = '';
          dispatch({
            type: ReducerActionType.ShowSnackbar,
            payload: {
              severity: 'warning',
              message: t('wifi:Upload File Fail'),
            },
          });
          return;
        } else {
          // setLogoFile(upload);
          if (event.target.id === 'logo') {
            setValue('logo', upload, { shouldDirty: true, shouldValidate: true });
            setLogoUrl(URL.createObjectURL(file));
          } else {
            setValue('line', upload, { shouldDirty: true, shouldValidate: true });
            setLineUrl(URL.createObjectURL(file));
          }
          event.target.value = '';
        }
      }
    }
  };

  const handleOnChangeFile: React.ChangeEventHandler<HTMLInputElement> = async (event) => {
    if (event.currentTarget.files != null) {
      if (event.currentTarget.files.length > 0) {
        const file = event.currentTarget.files[0];
        if (!file.type.includes('text/html')) {
          dispatch({
            type: ReducerActionType.ShowSnackbar,
            payload: {
              severity: 'warning',
              message: t('wifi:File Type is error. Only html files are allowed!'),
            },
          });
          return;
        }
        const upload = await uploadImg({ file, authorization, groupId });
        if (!upload) {
          dispatch({
            type: ReducerActionType.ShowSnackbar,
            payload: {
              severity: 'warning',
              message: t('wifi:Upload File Fail'),
            },
          });
          return;
        } else {
          const TermsName = file.name;
          switch (event.target.id) {
            case 'terms':
              setShowTerms(TermsName);
              setValue('terms', upload, { shouldDirty: true, shouldValidate: true });
              break;
            case 'termsEn':
              setTermsEn(TermsName);
              setValue('termsEn', upload, { shouldDirty: true, shouldValidate: true });
              break;
            case 'privacyTerms':
              setPrivacyTerms(TermsName);
              setValue('privacyTerms', upload, { shouldDirty: true, shouldValidate: true });
              break;
            case 'privacyTermsEn':
              setPrivacyTermsEn(TermsName);
              setValue('privacyTermsEn', upload, { shouldDirty: true, shouldValidate: true });
              break;
          }
        }
      }
    }
  };
  const handleClearImg = useCallback((event) => {
    if (event.currentTarget.ariaLabel === 'deleteLogo') {
      setLogoUrl('');
      setValue('logo', '', { shouldDirty: true, shouldValidate: true });
    } else {
      setLineUrl('');
      setValue('line', '', { shouldDirty: true, shouldValidate: true });
    }
  }, []);

  const handleClearFile = useCallback((event) => {
    switch (event.currentTarget.ariaLabel) {
      case 'deleteterms':
        setShowTerms('');
        //resetField('terms');
        setValue('terms', '', { shouldDirty: true, shouldValidate: true });
        break;
      case 'deletetermsEn':
        setTermsEn('');
        setValue('termsEn', '', { shouldDirty: true, shouldValidate: true });
        break;
      case 'deleteprivacyTerms':
        setPrivacyTerms('');
        setValue('privacyTerms', '', { shouldDirty: true, shouldValidate: true });
        break;
      case 'deleteprivacyTermsEn':
        setPrivacyTermsEn('');
        setValue('privacyTermsEn', '', { shouldDirty: true, shouldValidate: true });
        break;
    }
  }, []);

  const handleSwitchChange = useCallback(
    (to: boolean) => {
      if (to) {
        setValue('passShowTime', 0, { shouldDirty: true });
      } else {
        setValue('passShowTime', 1, { shouldDirty: true });
      }
      setToggle(!to);
    },
    [setToggle],
  );

  if (companyId) {
    const { error, refetch } = useQuery<SearchCompanyAdvanceResponse, SearchCompanyAdvancePayload>(
      SEARCH_COMPANYADVANCE_ON_WIFI,
      {
        variables: {
          groupId: permissionGroup?.group.id,
          companyId: companyId,
        },
        fetchPolicy: 'cache-and-network',
        onCompleted: ({ searchCompanyAdvance }) => {
          const currentCompany = searchCompanyAdvance.node;
          setCompanyAdvance(currentCompany);
          //setCompanyUI(currentCompany);
          reset({
            name,
            url,
            companyId,
            logo,
            line,
            ssid: currentCompany.ssid,
            serviceIntroduction: currentCompany.serviceIntroduction,
            serviceIntroductionEn: currentCompany.serviceIntroductionEn,
            accessTime: currentCompany.accessTime,
            dailyAccess: currentCompany.dailyAccess,
            accessLimit: currentCompany.accessLimit,
            downloadSpeed: currentCompany.downloadSpeed,
            uploadSpeed: currentCompany.uploadSpeed,
            idleTimeout: currentCompany.idleTimeout,
            terms: currentCompany.terms,
            termsEn: currentCompany.termsEn,
            privacyTerms: currentCompany.privacyTerms,
            privacyTermsEn: currentCompany.privacyTermsEn,
            passShowTime: currentCompany.passShowTime,
          });
          if (logo) {
            setLogoUrl(logo);
          }
          if (line) {
            setLineUrl(line);
          }
          setShowTerms(currentCompany.terms);
          setTermsEn(currentCompany.termsEn);
          setPrivacyTerms(currentCompany.privacyTerms);
          setPrivacyTermsEn(currentCompany.privacyTermsEn);
          if (currentCompany.passShowTime === 0) {
            setValue('passShowTime', 0, { shouldDirty: true });
            setToggle(true);
          } else {
            setValue('passShowTime', 1, { shouldDirty: true });
            setToggle(false);
          }
        },
      },
    );
  }

  const handleAddCompany = useCallback(
    ({
      id,
      //divisionId,
      name,
      logo,
      line,
      url,
      ssid,
      serviceIntroduction,
      serviceIntroductionEn,
      accessTime,
      dailyAccess,
      accessLimit,
      idleTimeout,
      terms,
      termsEn,
      privacyTerms,
      privacyTermsEn,
      downloadSpeed,
      uploadSpeed,
      passShowTime,
    }: FormData): Promise<FetchResult<AddCompanyResponse> | void> => {
      if (!divisionId) return Promise.resolve();

      return addCompany({
        variables: {
          groupId: permissionGroup?.group.id || '',
          divisionId: divisionId,
          name: name,
          logo: logo,
          line: line,
          url: url,
          ssid,
          serviceIntroduction,
          serviceIntroductionEn,
          accessTime: parseInt(accessTime.toString()),
          dailyAccess: parseInt(dailyAccess.toString()),
          accessLimit: parseInt(accessLimit.toString()),
          idleTimeout: parseInt(idleTimeout.toString()),
          terms,
          termsEn,
          privacyTerms,
          privacyTermsEn,
          downloadSpeed: parseInt(downloadSpeed.toString()),
          uploadSpeed: parseInt(uploadSpeed.toString()),
          passShowTime: parseInt(passShowTime.toString()),
        },
      });
    },
    [editDivisionId, addCompany],
  );

  const handleEditCompany = useCallback(
    ({
      id,
      companyId,
      name,
      logo,
      line,
      url,
      ssid,
      serviceIntroduction,
      serviceIntroductionEn,
      accessTime,
      dailyAccess,
      accessLimit,
      idleTimeout,
      terms,
      termsEn,
      privacyTerms,
      privacyTermsEn,
      downloadSpeed,
      uploadSpeed,
      passShowTime,
    }: FormData): Promise<FetchResult<EditCompanyResponse> | void> => {
      if (!companyId) return Promise.resolve();
      return editCompany({
        variables: {
          groupId: permissionGroup?.group.id || '',
          divisionId: divisionId,
          name: name,
          logo: logo,
          line: line,
          url: url,
          ssid: ssid,
          serviceIntroduction: serviceIntroduction,
          serviceIntroductionEn: serviceIntroductionEn,
          accessTime,
          dailyAccess,
          accessLimit,
          idleTimeout,
          terms: terms,
          termsEn: termsEn,
          privacyTerms: privacyTerms,
          privacyTermsEn: privacyTermsEn,
          downloadSpeed,
          uploadSpeed,
          passShowTime: passShowTime,
        },
      });
    },
    [editCompanyId, editCompany, logoUrl],
  );

  useEffect(() => {
    setEditDivisionId(divisionId);
    const typestatus = toggle === true ? 0 : 1;
    console.log('toggle', toggle);
    setValue('passShowTime', typestatus, { shouldDirty: true });
  }, [divisionId, setValue, toggle]);

  const onSubmit = useCallback<SubmitHandler<FormData>>(
    async (currentData: FormData) => {
      let isSaveSuccess = false;
      let isUploadSuccess = false;
      // if (!line) {
      //   const response = await fetch(linePic.src);
      //   const blob = await response.blob();
      //   const file = new File([blob], 'line.jpg', {
      //     type: blob.type,
      //   });
      //   const upload = await uploadImg({ file, authorization, groupId });
      //   if (upload !== '') {
      //     isUploadSuccess = true;
      //     currentData.line = upload;
      //   }
      // }
      if (type === 'E') {
        const updateResult = await Promise.allSettled([
          handleEditCompany(currentData),
          //...handleEditCompanyAdvance(currentData),
        ]);

        const rejectedResults = updateResult.filter((res) => res.status === 'rejected');

        if (rejectedResults.length === 0) {
          isSaveSuccess = true;
        } else {
          if (D_DEBUG) console.log(rejectedResults);
          isSaveSuccess = false;
        }
        if (isMountedRef.current) onClose();
      } else {
        const updateResult = await Promise.allSettled([handleAddCompany(currentData)]);
        const rejectedResults = updateResult.filter((res) => res.status === 'rejected');
        if (rejectedResults.length === 0) {
          isSaveSuccess = true;
        } else {
          if (D_DEBUG) console.log(rejectedResults);
          isSaveSuccess = false;
        }
        if (isMountedRef.current) onClose();
      }
      if (isSaveSuccess) {
        //await refetch();
        dispatch({
          type: ReducerActionType.ShowSnackbar,
          payload: {
            severity: 'success',
            message: t('wifi:The value has been saved successfully_', {
              count: 0, // always show plural here
            }),
          },
        });
      } else {
        dispatch({
          type: ReducerActionType.ShowSnackbar,
          payload: {
            severity: 'error',
            message: t('common:Save failed_ Please try again_'),
          },
        });
      }
      if (isMountedRef.current) onClose();
    },
    [handleEditCompany, handleAddCompany],
  );
  const requireFieldEmpty = t('wifi:This field cannot allow empty.');
  const selectFile = t('wifi:Select file');

  const lineRequired = errors.line && errors.line.type === 'required';
  const logoRequired = errors.logo && errors.logo.type === 'required';
  const lineRegist = register('line', { required: true });
  const logoRegist = register('logo', { required: true });
  return (
    <BaseDialog
      open={open}
      onClose={handleOnClose}
      title={type === 'E' ? t('wifi:Edit company info') : t('wifi:Add company detals')}
      titleAlign="center"
      titleVariant="h4"
      classes={{ dialog: classes.paper }}
      content={
        <Grid container spacing={2} className={classes.form} component="form">
          <Grid item xs={12}>
            <Typography variant="subtitle2" align="center" className={classes.subtitle}>
              {t('wifi:Company Basic Info')}
              <Divider orientation="horizontal" />
            </Typography>{' '}
          </Grid>

          <Grid item xs={6}>
            <TextField
              variant="outlined"
              type="text"
              label={t('wifi:Division ID')}
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={editDivisionId}
              disabled
            />
          </Grid>
          {companyId && (
            <Grid item xs={6}>
              <TextField
                variant="outlined"
                type="text"
                label={t('wifi:Company ID')}
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={watch('companyId')}
                disabled
              />
            </Grid>
          )}
          <Grid item xs={6}>
            <TextField
              variant="outlined"
              type="text"
              label={t('wifi:Name')}
              value={watch('name')}
              fullWidth
              InputLabelProps={{ shrink: true }}
              disabled={type === 'A' ? true : false}
              inputProps={{
                ...register('name', {
                  maxLength: {
                    value: 255,
                    message: t('common:Max_ {{count}} character', { count: 255 }),
                  },
                  required: requireFieldEmpty,
                }),
              }}
              error={!!errors.name}
              helperText={errors.name?.message}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              variant="outlined"
              type="text"
              label={t('wifi:Url')}
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={watch('url') || ''}
              inputProps={{
                ...register('url', {
                  maxLength: {
                    value: 255,
                    message: t('common:Max_ {{count}} character', { count: 255 }),
                  },
                  pattern: {
                    value: /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
                    message: t('Invalid URL format'),
                  },
                  required: requireFieldEmpty,
                }),
              }}
              error={!!errors.url}
              helperText={errors.url?.message}
            />
          </Grid>
          <Grid item xs={12}>
            <Card variant="outlined" className={logoRequired ? classes.imgErr : ''}>
              <Button
                color="primary"
                aria-label="upload picture"
                component="label"
                endIcon={<AddPhotoAlternateIcon />}
                className={logoRequired ? classes.imgNullCenter : classes.imgcenter}
              >
                {t('wifi:Select LOGO')}
                <Input
                  id="logo"
                  accept="image/gif, image/jpeg, image/png"
                  type="file"
                  onChange={(e) => {
                    logoRegist.onChange(e); // method from hook form register
                    handleOnChangeImage(e); // your method
                  }}
                  hidden
                />
              </Button>

              <Divider orientation="horizontal" className={logoRequired ? classes.imgErr : ''} />
              {logoUrl && (
                <ThemeIconButton
                  aria-label="deleteLogo"
                  classes={{
                    root: classes.uploadingCardIconBtn,
                  }}
                  onClick={handleClearImg}
                >
                  <HighlightOffIcon />
                </ThemeIconButton>
              )}
              {logoUrl && <img src={logoUrl} alt="" className={classes.uploadingCardImage} />}
              {/* {logoRequired && (
                <p className={classes.imgNullCenter}> {t('wifi:Please select the logo image')}</p>
              )} */}
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card variant="outlined" className={lineRequired ? classes.imgErr : ''}>
              <Button
                color="primary"
                aria-label="upload picture"
                component="label"
                endIcon={<AddPhotoAlternateIcon />}
                className={lineRequired ? classes.imgNullCenter : classes.imgcenter}
              >
                {t('wifi:Select Line')}
                <Input
                  // className="form-control"
                  id="line"
                  accept="image/gif, image/jpeg, image/png"
                  type="file"
                  onChange={(e) => {
                    lineRegist.onChange(e); // method from hook form register
                    handleOnChangeImage(e); // your method
                  }}
                  hidden
                />
              </Button>
              <Divider orientation="horizontal" className={lineRequired ? classes.imgErr : ''} />
              {lineUrl && (
                <ThemeIconButton
                  aria-label="deleteLine"
                  classes={{
                    root: classes.uploadingCardIconBtn,
                  }}
                  onClick={handleClearImg}
                >
                  <HighlightOffIcon />
                </ThemeIconButton>
              )}
              {lineUrl && <img src={lineUrl} alt="" className={classes.uploadingCardImage} />}
              {/* {lineRequired && (
                <p className={classes.imgNullCenter}> {t('wifi:Please select the line image')}</p>
              )} */}
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle2" align="center" className={classes.subtitle}>
              {t('wifi:Company Advance Info_')}
              <Divider orientation="horizontal" />
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <TextField
              variant="outlined"
              type="text"
              label={t('wifi:SSID')}
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={watch('ssid') || ''}
              inputProps={{
                ...register('ssid', {
                  maxLength: {
                    value: 255,
                    message: t('common:Max_ {{count}} character', { count: 255 }),
                  },
                  required: requireFieldEmpty,
                }),
              }}
              error={!!errors.ssid}
              helperText={errors.ssid?.message}
            />
          </Grid>
          <Grid item xs={3}>
            <TextField
              variant="outlined"
              type="number"
              label={t('wifi:Access Time')}
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={watch('accessTime')}
              inputProps={{
                ...register('accessTime', {
                  maxLength: {
                    value: 125,
                    message: t('common:Max_ {{count}} character', { count: 125 }),
                  },
                  required: requireFieldEmpty,
                }),
                max: 60,
                min: 1,
              }}
              error={!!errors.accessTime}
              helperText={errors.accessTime?.message}
            />
          </Grid>
          <Grid item xs={3}>
            <TextField
              variant="outlined"
              type="number"
              label={t('wifi:Daily Access')}
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={watch('dailyAccess')}
              inputProps={{
                ...register('dailyAccess', {
                  maxLength: {
                    value: 125,
                    message: t('common:Max_ {{count}} character', { count: 125 }),
                  },
                  required: requireFieldEmpty,
                }),
                min: 1,
              }}
              error={!!errors.dailyAccess}
              helperText={errors.dailyAccess?.message}
            />
          </Grid>
          <Grid item xs={3}>
            <TextField
              variant="outlined"
              type="number"
              label={t('wifi:Access Limit')}
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={watch('accessLimit')}
              inputProps={{
                ...register('accessLimit', {
                  maxLength: {
                    value: 125,
                    message: t('common:Max_ {{count}} character', { count: 125 }),
                  },
                  required: requireFieldEmpty,
                }),
                min: 1,
              }}
              error={!!errors.accessLimit}
              helperText={errors.accessLimit?.message}
            />
          </Grid>
          <Grid item xs={3}>
            <TextField
              variant="outlined"
              type="number"
              label={t('wifi:Idle Timeout')}
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={watch('idleTimeout') || ''}
              inputProps={{
                ...register('idleTimeout', {
                  maxLength: {
                    value: 125,
                    message: t('common:Max_ {{count}} character', { count: 125 }),
                  },
                  required: requireFieldEmpty,
                }),
                min: 1,
              }}
              error={!!errors.idleTimeout}
              helperText={errors.idleTimeout?.message}
            />
          </Grid>
          <Grid item xs={3}>
            <TextField
              variant="outlined"
              type="number"
              label={t('wifi:Download Speed')}
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={watch('downloadSpeed') || ''}
              inputProps={{
                ...register('downloadSpeed', {
                  maxLength: {
                    value: 125,
                    message: t('common:Max_ {{count}} character', { count: 125 }),
                  },
                  required: requireFieldEmpty,
                }),
                min: 1,
              }}
              error={!!errors.downloadSpeed}
              helperText={errors.downloadSpeed?.message}
            />
          </Grid>
          <Grid item xs={3}>
            <TextField
              variant="outlined"
              type="number"
              label={t('wifi:Upload Speed')}
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={watch('uploadSpeed') || ''}
              inputProps={{
                ...register('uploadSpeed', {
                  maxLength: {
                    value: 125,
                    message: t('common:Max_ {{count}} character', { count: 125 }),
                  },
                  required: requireFieldEmpty,
                }),
                min: 1,
              }}
              error={!!errors.uploadSpeed}
              helperText={errors.uploadSpeed?.message}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              variant="outlined"
              label={t('wifi:Service Introduction')}
              placeholder={t('wifi:Service Introduction')}
              fullWidth
              multiline
              rows={5}
              InputLabelProps={{
                shrink: true,
              }}
              inputProps={{
                ...register('serviceIntroduction', {
                  required: requireFieldEmpty,
                  maxLength: {
                    value: 2000,
                    message: t('common:Max_ {{count}} character', { count: 2000 }),
                  },
                }),
              }}
              error={!!errors.serviceIntroduction}
              helperText={errors.serviceIntroduction?.message}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              variant="outlined"
              label={t('wifi:Service Introduction En')}
              placeholder={t('wifi:Service Introduction En')}
              fullWidth
              multiline
              rows={5}
              InputLabelProps={{
                shrink: true,
              }}
              inputProps={{
                ...register('serviceIntroductionEn', {
                  maxLength: {
                    value: 2000,
                    message: t('common:Max_ {{count}} character', { count: 2000 }),
                  },
                  required: requireFieldEmpty,
                }),
              }}
              error={!!errors.serviceIntroductionEn}
              helperText={errors.serviceIntroductionEn?.message}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              variant="outlined"
              fullWidth
              placeholder={t('wifi:Show the time remaining page or not?')}
              InputProps={{
                readOnly: true,
                endAdornment: (
                  <section className={classes.basicInfo}>
                    <Switch
                      color="primary"
                      checked={toggle}
                      onChange={() => {
                        handleSwitchChange(toggle);
                      }}
                      name="checked"
                    />
                    <span className={classes.toggle}>{toggle ? t('wifi:Yes') : t('wifi:No')}</span>
                  </section>
                ),
              }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label={t('wifi:Terms')}
              variant="outlined"
              type="text"
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
              placeholder={t('wifi:Terms')}
              value={' ' + showTerms}
              InputProps={{
                readOnly: true,
                ...register('terms', {
                  required: requireFieldEmpty,
                  validate: (value) => value.length > 0,
                }),
                // startAdornment: showTerms && showTerms.toString().includes('http') && (

                // ),
                endAdornment: (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      flexWrap: 'nowrap',
                      alignContent: 'center',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                    }}
                  >
                    {showTerms ? (
                      <>
                        <ThemeIconButton
                          tooltip={t('wifi:Remove')}
                          aria-label="deleteterms"
                          classes={{
                            root: classes.uploadingCardIconBtn,
                          }}
                          onClick={handleClearFile}
                        >
                          <HighlightOffIcon />
                        </ThemeIconButton>
                        {/* <Tooltip
                          title="preview"
                          classes={{
                            tooltipPlacementBottom: classes.tooltip,
                            tooltipPlacementTop: classes.tooltip,
                          }}
                        >
                          <Link href={showTerms} target="_blank">
                            <PreviewIcon fontSize="large" />
                          </Link>
                        </Tooltip> */}
                      </>
                    ) : (
                      <Tooltip
                        title={selectFile}
                        classes={{
                          tooltipPlacementBottom: classes.tooltip,
                          tooltipPlacementTop: classes.tooltip,
                        }}
                      >
                        <Button
                          color="primary"
                          aria-label="upload picture"
                          component="label"
                          endIcon={<FileOpenIcon />}
                        >
                          <Input
                            id="terms"
                            accept="text/html"
                            type="file"
                            onChange={handleOnChangeFile}
                            hidden
                          ></Input>
                        </Button>
                      </Tooltip>
                    )}
                  </div>
                ),
              }}
              error={!!errors.terms}
              helperText={errors.terms?.message}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              label={t('wifi:Terms En')}
              variant="outlined"
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
              //  placeholder={t('wifi:Terms')}
              value={termsEn}
              InputProps={{
                readOnly: true,
                ...register('termsEn', {
                  required: requireFieldEmpty,
                  validate: (value) => value.length > 0,
                }),
                endAdornment: (
                  <div>
                    {termsEn && (
                      <ThemeIconButton
                        tooltip={t('wifi:Remove')}
                        aria-label="deletetermsEn"
                        classes={{
                          root: classes.uploadingCardIconBtn,
                        }}
                        onClick={handleClearFile}
                      >
                        <HighlightOffIcon />
                      </ThemeIconButton>
                    )}
                    {!termsEn && (
                      <Tooltip
                        title={selectFile}
                        classes={{
                          tooltipPlacementBottom: classes.tooltip,
                          tooltipPlacementTop: classes.tooltip,
                        }}
                      >
                        <Button
                          color="primary"
                          aria-label="upload picture"
                          component="label"
                          endIcon={<FileOpenIcon />}
                        >
                          <Input
                            id="termsEn"
                            accept="text/html"
                            type="file"
                            onChange={handleOnChangeFile}
                            hidden
                          />
                        </Button>
                      </Tooltip>
                    )}
                  </div>
                ),
              }}
              error={!!errors.termsEn}
              helperText={errors.termsEn?.message}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label={t('wifi:Privacy Terms')}
              variant="outlined"
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
              //  placeholder={t('wifi:Terms')}
              value={privacyTerms}
              InputProps={{
                readOnly: true,
                ...register('privacyTerms', {
                  required: requireFieldEmpty,
                  validate: (value) => value.length > 0,
                }),
                endAdornment: (
                  <div>
                    {privacyTerms && (
                      <ThemeIconButton
                        tooltip={t('wifi:Remove')}
                        aria-label="deleteprivacyTerms"
                        classes={{
                          root: classes.uploadingCardIconBtn,
                        }}
                        onClick={handleClearFile}
                      >
                        <HighlightOffIcon />
                      </ThemeIconButton>
                    )}

                    {!privacyTerms && (
                      <Tooltip
                        title={selectFile}
                        classes={{
                          tooltipPlacementBottom: classes.tooltip,
                          tooltipPlacementTop: classes.tooltip,
                        }}
                      >
                        <Button
                          color="primary"
                          aria-label="upload picture"
                          component="label"
                          endIcon={<FileOpenIcon />}
                        >
                          <Input
                            id="privacyTerms"
                            accept="text/html"
                            type="file"
                            onChange={handleOnChangeFile}
                            hidden
                          />
                        </Button>
                      </Tooltip>
                    )}
                  </div>
                ),
              }}
              error={!!errors.privacyTerms}
              helperText={errors.privacyTerms?.message}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label={t('wifi:Privacy Terms En')}
              variant="outlined"
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
              //  placeholder={t('wifi:Terms')}
              value={privacyTermsEn}
              InputProps={{
                readOnly: true,
                ...register('privacyTermsEn', {
                  required: requireFieldEmpty,
                  validate: (value) => value.length > 0,
                }),
                endAdornment: (
                  <div>
                    {privacyTermsEn && (
                      <ThemeIconButton
                        aria-label="deleteprivacyTermsEn"
                        classes={{
                          root: classes.uploadingCardIconBtn,
                        }}
                        onClick={handleClearFile}
                      >
                        <HighlightOffIcon />
                      </ThemeIconButton>
                    )}
                    {!privacyTermsEn && (
                      <Tooltip
                        title={selectFile}
                        classes={{
                          tooltipPlacementBottom: classes.tooltip,
                          tooltipPlacementTop: classes.tooltip,
                        }}
                      >
                        <Button
                          color="primary"
                          aria-label="upload picture"
                          component="label"
                          endIcon={<FileOpenIcon />}
                        >
                          <Input
                            id="privacyTermsEn"
                            accept="text/html"
                            type="file"
                            onChange={handleOnChangeFile}
                            hidden
                          />
                        </Button>
                      </Tooltip>
                    )}
                  </div>
                ),
              }}
              error={!!errors.privacyTermsEn}
              helperText={errors.privacyTermsEn?.message}
            />
          </Grid>
          <Button
            variant="contained"
            color="primary"
            disabled={Object.keys(dirtyFields).length === 0 || !isValid}
            className={classes.button}
            onClick={handleSubmit(onSubmit)}
          >
            {t('wifi:Save')}
          </Button>
        </Grid>
      }
    />
  );
};

export default WIFICompany;
