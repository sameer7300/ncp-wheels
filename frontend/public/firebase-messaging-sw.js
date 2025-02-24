importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyAXBSYGMKJKUXZLPVIYPFUXtFvPVxIlxAw",
  authDomain: "ncp-wheels.firebaseapp.com",
  projectId: "ncp-wheels",
  storageBucket: "ncp-wheels.appspot.com",
  messagingSenderId: "1091160790274",
  appId: "1:1091160790274:web:9c8e4c5c7b5f7f7f7f7f7f"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Received background message:', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo192.png'
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});
