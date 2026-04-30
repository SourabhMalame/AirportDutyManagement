const admin = require('firebase-admin');
const path = require('path');

let initialized = false;

function initFirebase() {
  if (initialized) return;
  try {
    const serviceAccount = require(path.join(__dirname, '..', 'serviceAccountKey.json'));
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    initialized = true;
  } catch (err) {
    console.warn('[FCM] Firebase not initialized — serviceAccountKey.json missing:', err.message);
  }
}

initFirebase();

exports.sendPushNotification = async ({ token, title, body, data = {} }) => {
  if (!initialized || !token) return;
  try {
    await admin.messaging().send({
      token,
      notification: { title, body },
      data: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)])),
      android: { priority: 'high', notification: { sound: 'default', channelId: 'duty_assignments' } },
    });
  } catch (err) {
    console.warn('[FCM] Send failed:', err.message);
  }
};
