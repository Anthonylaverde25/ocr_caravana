// import { useEffect, useState } from 'react';
// import { Camera } from 'react-native-vision-camera';

// export const useCameraPermissions = () => {
//   const [hasPermission, setHasPermission] = useState<boolean | null>(null);

//   useEffect(() => {
//     (async () => {
//       const status = await Camera.requestCameraPermission();
//       setHasPermission(status === 'granted');
//     })();
//   }, []);

//   return hasPermission;
// };

import { useEffect, useState } from 'react';
import { Camera } from 'react-native-vision-camera';

export const useCameraPermissions = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      // Solicita permiso de cámara al montar el hook
      const status = await Camera.requestCameraPermission();
      setHasPermission(status === 'granted');
    })();
  }, []);

  return hasPermission;
};