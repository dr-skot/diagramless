export const handleDroppedFile = (callback: (buf: ArrayBuffer) => void) => (event: any) => {
  event.preventDefault();
  const transfer = event.dataTransfer;
  const file =
    transfer?.items?.[0].kind === 'file' ? transfer.items[0].getAsFile() : transfer?.files?.[0];

  if (!file) {
    console.error('No file found');
  } else {
    const reader = new FileReader();
    reader.onabort = () => console.error('File reading was aborted');
    reader.onerror = () => console.error('File reading has failed');
    reader.onload = () => callback(reader.result as ArrayBuffer);
    reader.readAsArrayBuffer(file);
  }
};
