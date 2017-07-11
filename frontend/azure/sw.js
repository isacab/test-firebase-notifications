const apiBaseUrl = 'https://testfirebasenotifications.azurewebsites.net/api';
const maxNumRetries = 10;
const maxBackOff = 60000;

self.addEventListener('install', function(event) {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', function(event) {
  event.waitUntil(self.clients.claim());
});

// Listener for push notifications
// Note: When defining a custom push listener, the firebase messaging event onMessage in the clients will not be called
self.addEventListener('push', function (event) {
    //console.log('[sw.js] Received a push message', event.data.json());

    if (!event.data) {
        return;
    }

    var data = {};
    var json = event.data.json();
    if (json) {
        data = json.data;
    }

    var notification = event.notification || {};

    stopTimer(data).then((dataFromServer) => {
        sendMessageToAllClients({
            messageType: 'notification',
            data: dataFromServer
        }, () => {});
    });

    var title = notification.title || 'Hey!';
    var options = {
        body: notification.body || 'You have received a notification :)',
        data: data,
        icon: "assets/img/notification_big.png",
        badge: "assets/img/notification_icon.png",
        //requireInteraction: true,
    }

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

// Called when user clicks on the notification
// Note: this method will not be called when the incoming message have defined the "notification" property. 
self.addEventListener('notificationclick', function(event) {
    let notification = event.notification;
    let data = notification.data || {};
    data.tap = true;

    event.notification.close();

    // This looks to see if the test associated with the notification is already open and
    // focuses if it is
    event.waitUntil(clients.matchAll({
        type: "window"
    }).then(function(clientList) {
        var url = "/#/test/"+data.testId;
        for (var i = 0; i < clientList.length; i++) {
            var client = clientList[i];
            if (client.url.indexOf(url) !== -1 && 'focus' in client)
                return client.focus();
        }
        if (clients.openWindow)
            return clients.openWindow(url);
    }));
});

// Send received notification to server to stop the timer
// Returns a promise that resolves if data could be sent to server
function stopTimer(data, retryAttempt = 0)
{
    const url = apiBaseUrl + '/testpushnotifications/stoptimer';

    if(!data)
        return Promise.reject("Data is null");
    
    data.receivedClient = new Date().getTime();

    return fetch(url, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'accept': 'application/json',
            'content-type': 'application/json'
        },
        mode: 'cors'
    }).then(function(response) {
        return response.json();
    }).catch(function(reason) {
        // handle failure
        console.warn('[sw.js] Could not notify server, retryAttempt: ' + retryAttempt + ', reason: ', reason);
        data.obsolete = true;
        if(retryAttempt < maxNumRetries) {
            // retry using exponential backoff
            var backoff = getBackOff(++retryAttempt, maxBackOff);
            return delay(backoff).then(() => {
                return this.stopTimer(data, retryAttempt);
            });
        }
        console.error('[sw.js] All retry attempts made for notification', data);
        return Promise.reject(reason); //data;
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