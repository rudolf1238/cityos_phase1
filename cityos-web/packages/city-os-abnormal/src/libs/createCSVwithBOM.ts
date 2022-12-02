export default function createCSVwithBOM(text: string): Blob {
  return new Blob([new Uint8Array([0xef, 0xbb, 0xbf]), text], {
    type: 'text/csv;charset=utf-8;',
  });
}
