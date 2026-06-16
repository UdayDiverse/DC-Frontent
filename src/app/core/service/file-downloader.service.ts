import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class FileDownloaderService {
  openFileInNewTab(file: { documentName: string; documentData: string }) {
    const { documentName, documentData } = file;

    // Clean and pad the base64 string
    let cleanBase64 = documentData.replace(/[\r\n\s]/g, '');
    const padding = 4 - (cleanBase64.length % 4);
    if (padding < 4) {
      cleanBase64 += '='.repeat(padding);
    }

    try {
      // Decode base64 to binary
      const binaryString = atob(cleanBase64);
      const byteArray = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        byteArray[i] = binaryString.charCodeAt(i);
      }

      // Create blob and object URL
      const blob = new Blob([byteArray], { type: 'application/pdf' }); // Change type if not always PDF
      const url = URL.createObjectURL(blob);

      // Open in new tab
      window.open(url, '_blank');

      // Cleanup after some delay
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch (e) {
      console.error(`Failed to open ${documentName}:`, e);
      alert(`Failed to open ${documentName}`);
    }
  }
}
