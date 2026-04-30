import notifee, {AndroidImportance, EventType} from '@notifee/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SEEN_KEY = '@duty_seen_ids';
const CHANNEL_ID = 'duty_assignments';

async function ensureChannel() {
  return notifee.createChannel({
    id: CHANNEL_ID,
    name: 'Duty Assignments',
    importance: AndroidImportance.HIGH,
  });
}

export async function requestNotificationPermission() {
  try {
    await notifee.requestPermission();
    return true;
  } catch {
    return false;
  }
}

export async function checkAndNotifyNewDuties(duties) {
  if (!duties || duties.length === 0) return;

  try {
    const raw = await AsyncStorage.getItem(SEEN_KEY);
    const seenIds = raw ? JSON.parse(raw) : null;

    const allIds = duties.map(d => d._id || d.id).filter(Boolean);

    if (seenIds === null) {
      // First load — store IDs silently, don't spam on first open
      await AsyncStorage.setItem(SEEN_KEY, JSON.stringify(allIds));
      return;
    }

    const newDuties = duties.filter(d => {
      const id = d._id || d.id;
      return id && !seenIds.includes(id);
    });

    if (newDuties.length > 0) {
      const channelId = await ensureChannel();
      if (newDuties.length === 1) {
        const d = newDuties[0];
        await notifee.displayNotification({
          title: 'New Duty Assigned',
          body: `Flight ${d.flightNo || '—'} at ${d.airportName || 'Airport'} on ${d.date || '—'}`,
          data: {dutyId: String(d._id || d.id || '')},
          android: {channelId, pressAction: {id: 'default'}, smallIcon: 'ic_launcher'},
        });
      } else {
        await notifee.displayNotification({
          title: `${newDuties.length} New Duties Assigned`,
          body: 'You have new duty assignments. Open the app to view.',
          android: {channelId, pressAction: {id: 'default'}, smallIcon: 'ic_launcher'},
        });
      }
    }

    await AsyncStorage.setItem(SEEN_KEY, JSON.stringify(allIds));
  } catch {
    // Silent — notifications are non-critical
  }
}

export function setupForegroundNotificationListener(navigationRef) {
  return notifee.onForegroundEvent(({type, detail}) => {
    if (type === EventType.PRESS && detail.notification) {
      const dutyId = detail.notification.data?.dutyId;
      if (dutyId && navigationRef?.current) {
        navigationRef.current.navigate('DutyDetail', {dutyId});
      }
    }
  });
}
