import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

  //document.write(`<script type="text/javascript" src="cordova.js"></script>`);

/*if (environment.cordova) {
  // include the cordova script
  //document.write(`<script type="text/javascript" src="cordova.js"></script>`);
}*/

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch((error) => {
    var appRoot = document.getElementById("app-root");
    appRoot.className += " hidden";
    
    var initError = document.getElementById("init-error");
    initError.className = initError.className.replace(/\bhidden\b/,'');
    initError.innerHTML = error.message || error;
  });
