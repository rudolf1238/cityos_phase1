const downloadFile = (file: Blob, fileName: string): void => {
  const url = URL.createObjectURL(file);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  link.click();

  URL.revokeObjectURL(url);
};

export default downloadFile;
