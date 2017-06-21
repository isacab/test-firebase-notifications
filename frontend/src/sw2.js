// Use this to listen for messages from client
self.addEventListener('message', function(event){
    const message = event.data;
    if(message == 'ping') {
        event.ports[0].postMessage({
            messageType: 'ping',
            data: 'ping'
        });
    }
});

// Use this to listen for messages from client
self.addEventListener('install', function(event){
    console.log("[sw.js] install");
    
    event.waitUntil(new Promise((resolve, reject) => {
        setTimeout(resolve, 800);
    }));
});

self.addEventListener('activate', function(event) {
    console.log("[sw.js] activate");
});