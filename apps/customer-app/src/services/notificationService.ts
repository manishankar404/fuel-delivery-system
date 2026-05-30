// import * as Notifications
// from 'expo-notifications';

// import * as Device
// from 'expo-device';

// import Constants
// from 'expo-constants';

// import { supabase }
// from '../lib/supabase';

// export const registerForPushNotifications =
//   async (
//     profileId: string
//   ) => {
//     if (!Device.isDevice) {
//       return;
//     }

//     const {
//       status:
//         existingStatus,
//     } =
//       await Notifications
//         .getPermissionsAsync();

//     let finalStatus =
//       existingStatus;

//     if (
//       existingStatus !==
//       'granted'
//     ) {
//       const {
//         status,
//       } =
//         await Notifications
//           .requestPermissionsAsync();

//       finalStatus =
//         status;
//     }

//     if (
//       finalStatus !==
//       'granted'
//     ) {
//       return;
//     }

//     const token =
//       (
//         await Notifications
//           .getExpoPushTokenAsync({
//             projectId:
//               Constants
//                 .expoConfig
//                 ?.extra
//                 ?.eas
//                 ?.projectId,
//           })
//       ).data;

//     await supabase
//       .from('profiles')
//       .update({
//         expo_push_token:
//           token,
//       })
//       .eq(
//         'id',
//         profileId
//       );

//     return token;
//   };

export const registerForPushNotifications = async () => { console.log( 'Push notifications disabled for Expo Go MVP build' ); return null; };