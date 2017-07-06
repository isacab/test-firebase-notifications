self.importScripts('https://www.gstatic.com/firebasejs/3.5.2/firebase-app.js');
self.importScripts('https://www.gstatic.com/firebasejs/3.5.2/firebase-messaging.js');

// Initialize the Firebase app in the service worker by passing in the messagingSenderId.
firebase.initializeApp({
    'messagingSenderId': '170551356465'
});

// Retrieve an instance of Firebase Messaging so that it can handle background messages.
const messaging = firebase.messaging();

// Use this to handle incomming push notifications when the app is in background
// Note: this method will not be called when the incoming message have defined the "notification" property. 
/*messaging.setBackgroundMessageHandler(function (payload) {
    var data = payload.data;
    var notification = payload.notification;
    data.failed = true;

    var title = data.title || 'Hey!';
    var options = {
        body: data.body || 'You have received a notification :)',
        tag: 'test-firebase-notification',
        renotify: true,
        //icon: "images/new-notification.png,"
        requireInteraction: true,
    }

    return self.registration.showNotification(title, options);
});*/