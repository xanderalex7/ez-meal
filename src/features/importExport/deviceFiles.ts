import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

export type PickedCsvFile =
  | {
      canceled: true;
    }
  | {
      canceled: false;
      name: string;
      uri: string;
    };

export async function pickCsvFile(): Promise<PickedCsvFile> {
  const result = await DocumentPicker.getDocumentAsync({
    copyToCacheDirectory: true,
    multiple: false,
    type: ['text/csv', 'text/comma-separated-values', 'application/csv', '*/*'],
  });

  if (result.canceled || !result.assets?.[0]) {
    return { canceled: true };
  }

  const asset = result.assets[0];
  return {
    canceled: false,
    name: asset.name,
    uri: asset.uri,
  };
}

export async function readCsvFile(uri: string): Promise<string> {
  if (Platform.OS === 'web') {
    const response = await fetch(uri);
    if (!response.ok) {
      throw new Error('Lettura CSV non riuscita.');
    }

    return response.text();
  }

  return FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.UTF8 });
}

export async function shareCsvFile(csv: string, exportedAt: Date): Promise<void> {
  const fileName = `ez-meal-export-${formatFileTimestamp(exportedAt)}.csv`;

  if (Platform.OS === 'web') {
    downloadCsvInBrowser(csv, fileName);
    return;
  }

  const cacheDirectory = FileSystem.cacheDirectory;
  if (!cacheDirectory) {
    throw new Error('Cache directory non disponibile.');
  }

  const fileUri = `${cacheDirectory}${fileName}`;
  await FileSystem.writeAsStringAsync(fileUri, csv, { encoding: FileSystem.EncodingType.UTF8 });

  const sharingAvailable = await Sharing.isAvailableAsync();
  if (!sharingAvailable) {
    throw new Error('Condivisione file non disponibile su questo dispositivo.');
  }

  await Sharing.shareAsync(fileUri, {
    dialogTitle: 'Esporta CSV EZ-MEAL',
    mimeType: 'text/csv',
    UTI: 'public.comma-separated-values-text',
  });
}

function formatFileTimestamp(date: Date) {
  return date.toISOString().replaceAll(':', '-').replace(/\.\d{3}Z$/, 'Z');
}

function downloadCsvInBrowser(csv: string, fileName: string) {
  if (typeof document === 'undefined' || typeof URL === 'undefined' || typeof Blob === 'undefined') {
    throw new Error('Download CSV non disponibile su questo browser.');
  }

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}
