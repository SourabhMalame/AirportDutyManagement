import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import {getMessaging, setBackgroundMessageHandler} from '@react-native-firebase/messaging';

// Background + quit state FCM handler — must be registered before AppRegistry
setBackgroundMessageHandler(getMessaging(), async () => {
  // FCM shows the notification natively when app is in background/killed
});

AppRegistry.registerComponent(appName, () => App);
