self.importScripts('https://www.gstatic.com/firebasejs/3.5.2/firebase-app.js');
self.importScripts('https://www.gstatic.com/firebasejs/3.5.2/firebase-messaging.js');

// Initialize the Firebase app in the service worker by passing in the messagingSenderId.
firebase.initializeApp({
    'messagingSenderId': '170551356465'
});

// Retrieve an instance of Firebase Messaging so that it can handle background messages.
const messaging = firebase.messaging();
const apiBaseUrl = 'http://localhost:58378/api';

// Use this to handle incomming push notifications when the app is in background
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

/*self.addEventListener('install', function(event) {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', function(event) {
  event.waitUntil(self.clients.claim());
});*/

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
    
    // if (!(self.Notification && self.Notification.permission === 'granted')) {
    //     return;
    // }

    var title = data.title || 'Notification!';
    var options = {
        body: data.body || '',
        tag: 'test-firebase-notification',
        renotify: true,
        //icon: "images/new-notification.png,"
        requireInteraction: true,
    }

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

self.addEventListener('notificationclick', function (event) {
    console.log('On notification click: ', event.notification);

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
/*self.addEventListener('message', function(event){
    const message = event.data;
    if(message == 'ping') {
        event.ports[0].postMessage({
            messageType: 'ping',
            data: 'ping'
        });
    }
});*/

// Send received notification to server to stop the timer
// Returns a promise that resolves if data could be sent to server
function notifyServer(data, retryAttempt = 0)
{
    const url = apiBaseUrl + '/testpushnotifications/stoptimer';
    const maxNumRetries = 10;
    const maxBackOff = 60000;
    return fetch(url, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'accept': 'application/json',
            'content-type': 'application/json'
        },
        mode: 'CORS'
    }).then(function(response) {
        return response.json();
    }).catch(function(reason) {
        // handle failure
        console.log('[sw.js] Could not notify server, retryAttempt: ' + retryAttempt + ', reason: ', reason);
        data.obsolete = true;
        if(retryAttempt < maxNumRetries) {
            // retry using exponential backoff
            var backoff = getBackOff(++retryAttempt, maxBackOff);
            return delay(backoff).then(() => {
                return this.notifyServer(data, retryAttempt);
            });
        }
        console.err('[sw.js] All retry attempts made for notification', data);
        return Promise.reject(reason); //data;
    }).then((data) => {
        sendMessageToAllClients({
            messageType: 'notification',
            notificationData: data
        });  
        return retryAttempt;
    });
}

function sendMessageToClient(client, message) {
    var channel = new MessageChannel();
    client.postMessage(message, [channel.port2]);
}

function sendMessageToAllClients(message) {
    clients.matchAll().then(clients => {
        clients.forEach(client => {
            sendMessageToClient(client, message);
        });
    });
}

function delay(t) {
   return new Promise(function(resolve) { 
       setTimeout(resolve, t)
   });
}

function getBackOff(retryAttempt, maxBackOff) {
    let backoff = Math.pow(2, retryAttempt) * 1000;
    return Math.min(backoff, maxBackOff);
}