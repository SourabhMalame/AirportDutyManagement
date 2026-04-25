import {useEffect} from 'react';
import {setupForegroundNotificationListener, requestNotificationPermission} from '../utils/notificationHandler';
import Toast from 'react-native-toast-message';

export const useNotifications = () => {
  useEffect(() => {
    requestNotificationPermission();
    const unsubscribe = setupForegroundNotificationListener(msg => {
      Toast.show({
        type: 'info',
        text1: msg?.notification?.title || 'New Notification',
        text2: msg?.notification?.body || '',
      });
    });
    return unsubscribe;
  }, []);
};
