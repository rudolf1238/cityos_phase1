import { isString } from 'city-os-common/libs/validators';

const uploadFile = (acceptType: string): Promise<string> =>
  new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', acceptType);
    input.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const result = event.target?.result;
          if (isString(result)) {
            resolve(result);
          } else {
            reject(new Error('The file contents are not strings'));
          }
        };
        reader.readAsText(file);
      } else {
        reject(new Error('No file was found'));
      }
    };
    input.click();
  });

export default uploadFile;
