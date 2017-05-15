import { isDevMode } from '@angular/core';

export const Shared = Object.freeze({
    
    // URL to web api
    BASE_API_URL: isDevMode() ? 'http://localhost:4200/api' : 'http://testfrontend.azurewebsite.net/api',
    
});