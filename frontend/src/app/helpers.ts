export const Helpers = Object.freeze({

    getErrorCode(error) {
        let code : string;

        if(error !== null && typeof error === 'object') {
          code = error.code;
        }

        return code;
    } 
    
});