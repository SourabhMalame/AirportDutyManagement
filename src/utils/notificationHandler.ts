// Firebase Cloud Messaging handler
// To enable: npm install @react-native-firebase/app @react-native-firebase/messaging
// Then uncomment the imports below and follow Firebase setup in the README

export async function requestNotificationPermission() {
  // const messaging = require('@react-native-firebase/messaging').default;
  // const status = await messaging().requestPermission();
  // return status === messaging.AuthorizationStatus.AUTHORIZED;
  return false;
}

export async function getFCMToken() {
  // const messaging = require('@react-native-firebase/messaging').default;
  // return await messaging().getToken();
  return null;
}

export function setupForegroundNotificationListener(onMessage) {
  // const messaging = require('@react-native-firebase/messaging').default;
  // return messaging().onMessage(async remoteMessage => {
  //   onMessage && onMessage(remoteMessage);
  // });
  return () => {};
}
