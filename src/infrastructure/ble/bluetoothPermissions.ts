import { PermissionsAndroid, Platform } from 'react-native';

/**
 * Android 12+ asks for BLUETOOTH_SCAN / BLUETOOTH_CONNECT; older versions tie BLE scanning
 * to fine location. iOS asks by itself the first time the BLE manager starts.
 */
export async function requestBluetoothPermissions(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return true;
  }

  if (Platform.Version >= 31) {
    const result = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
    ]);
    return Object.values(result).every((r) => r === PermissionsAndroid.RESULTS.GRANTED);
  }

  const location = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
  return location === PermissionsAndroid.RESULTS.GRANTED;
}
