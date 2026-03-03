import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';

const BACKUP_FILE = 'words-backup.json';

export type BackupData = {
  words: any[];
  stats: any;
};

/* ================= EXPORT ================= */

export async function exportBackup(data: BackupData) {
  const directory =
    FileSystem.documentDirectory ?? FileSystem.cacheDirectory;

  if (!directory) {
    throw new Error('No writable directory available');
  }

  const path = directory + BACKUP_FILE;

  await FileSystem.writeAsStringAsync(
    path,
    JSON.stringify(data, null, 2),
    { encoding: FileSystem.EncodingType.UTF8 }
  );

  const canShare = await Sharing.isAvailableAsync();

  if (!canShare) {
    throw new Error('Sharing is not available on this device');
  }

  await Sharing.shareAsync(path, {
    mimeType: 'application/json',
    dialogTitle: 'Export words backup',
  });
}

/* ================= IMPORT ================= */

export async function importBackup(): Promise<BackupData | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: 'application/json',
    copyToCacheDirectory: true,
    multiple: false,
  });

  if (result.canceled) {
    return null;
  }

  const asset = result.assets?.[0];
  if (!asset?.uri) {
    throw new Error('No file selected');
  }

  const content = await FileSystem.readAsStringAsync(
    asset.uri,
    { encoding: FileSystem.EncodingType.UTF8 }
  );

  return JSON.parse(content) as BackupData;
}