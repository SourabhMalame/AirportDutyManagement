import {useEffect} from 'react';
import {getMessaging, getToken, onTokenRefresh, onMessage} from '@react-native-firebase/messaging';
import notifee, {AndroidImportance} from '@notifee/react-native';
import {requestNotificationPermission} from '../utils/notificationHandler';
import {saveFcmTokenApi} from '../api/authApi';

async function displayFcmAsNotifee(remoteMessage) {
  const channelId = await notifee.createChannel({
    id: 'duty_assignments',
    name: 'Duty Assignments',
    importance: AndroidImportance.HIGH,
  });
  await notifee.displayNotification({
    title: remoteMessage.notification?.title || 'New Notification',
    body: remoteMessage.notification?.body || '',
    data: remoteMessage.data || {},
    android: {channelId, pressAction: {id: 'default'}, smallIcon: 'ic_launcher'},
  });
}

export const useNotifications = () => {
  useEffect(() => {
    requestNotificationPermission();

    const m = getMessaging();

    getToken(m)
      .then(token => { if (token) saveFcmTokenApi(token).catch(() => {}); })
      .catch(() => {});

    const unsubRefresh = onTokenRefresh(m, token => {
      saveFcmTokenApi(token).catch(() => {});
    });

    const unsubForeground = onMessage(m, async remoteMessage => {
      await displayFcmAsNotifee(remoteMessage);
    });

    return () => {
      unsubRefresh();
      unsubForeground();
    };
  }, []);
};
