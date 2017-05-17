import { isDevMode } from '@angular/core';

export const Shared = Object.freeze({
    
    // URL to web api
    BASE_API_URL: isDevMode() ? 'http://localhost:21378/api' : 'http://testfrontend.azurewebsite.net/api',

    getErrorCode(error) {
        let code : string;

        if(error !== null && typeof error === 'object') {
          code = error.code;
        }

        return code;
    } 
    
});