self.importScripts('https://www.gstatic.com/firebasejs/3.5.2/firebase-app.js');
self.importScripts('https://www.gstatic.com/firebasejs/3.5.2/firebase-messaging.js');

// Initialize the Firebase app in the service worker by passing in the messagingSenderId.
firebase.initializeApp({
    'messagingSenderId': '170551356465'
});

// Retrieve an instance of Firebase Messaging so that it can handle background messages.
const messaging = firebase.messaging();

const apiBaseUrl = 'http://localhost:21378/api';

const receivedMessages = [];

/*messaging.setBackgroundMessageHandler(function (payload) {
    console.log('[sw.js] Received background message ', payload);
    var data = payload.data;

    var title = data.title || 'Notification!';
    var options = {
        body: data.body || '',
        tag: 'test-firebase-notification',
        //icon: "images/new-notification.png"
    }

    return self.registration.showNotification(title, options);
});*/

self.addEventListener('install', function(event) {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', function(event) {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', function (event) {
    console.log('[sw.js] Received a push message', event.data.json());

    if (!event.data) {
        return;
    }

    var data = {};
    var json = event.data.json();
    if (json) {
        data = json.data;
    }

    notifyServer(data);

    //let receivedDateTime = new Date().getTime();

    //data.receivedDateTime = receivedDateTime;
    
    if (!(self.Notification && self.Notification.permission === 'granted')) {
        return;
    }

    var title = data.title || 'Notification!';
    var options = {
        body: data.body || '',
        tag: 'test-firebase-notification',
        renotify: true,
        //icon: "images/new-notification.png"
    }

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

self.addEventListener('notificationclick', function (event) {
    console.log('On notification click: ', event.notification.tag);

    event.notification.close();

    // This looks to see if the current is already open and  
    // focuses if it is  
    event.waitUntil(
        clients.matchAll({
            includeUncontrolled: true,
            type: "window"
        })
        .then(function (clientList) {
            for (var i = 0; i < clientList.length; i++) {
                var client = clientList[i];
                if (client.url == '/' && 'focus' in client)
                    return client.focus();
            }
            if (clients.openWindow) {
                return clients.openWindow('/');
            }
        })
    );
});

// Use this to listen for messages from client
self.addEventListener('message', function(event){
    const message = event.data;

    if(message === 'getAll') {
        event.ports[0].postMessage({
            messageType: 'getAll',
            allReceived: receivedMessages
        });
    } else if(message === 'clear') {
        receivedMessages.splice(0, receivedMessages.length);
        event.ports[0].postMessage({
            messageType: 'clear',
            allReceived: receivedMessages
        });
    }
});

function notifyServer(data)
{
    let url = apiBaseUrl + '/pushnotifications/stoptimer';
    fetch(url, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'accept': 'application/json',
            'content-type': 'application/json'
        },
        mode: 'CORS'
    }).then(function(response) {
        return response.json();
    }).then(function(data) {
        console.log('[sw.js] response from server ', data);

        receivedMessages.push(data);
    
        sendMessageToAllClients({
            messageType: 'stopTimer',
            received: data,
            allReceived: receivedMessages
        });
    }).catch(function(reason) {
        console.log('[sw.js] could not notify server ', reason);
    });
}

function sendMessageToClient(client, message){
    return new Promise(function(resolve, reject){
        var channel = new MessageChannel();
        client.postMessage(message, [channel.port2]);
    });
}

function sendMessageToAllClients(message){
    clients.matchAll().then(clients => {
        clients.forEach(client => {
            sendMessageToClient(client, message);
        });
    });
}

/* Use this function to send messages from client to service worker.
function send_message_to_sw(msg){
    navigator.serviceWorker.controller.postMessage(msg);
}*/