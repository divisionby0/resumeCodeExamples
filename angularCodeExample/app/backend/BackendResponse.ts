export class BackendResponse {
    private result:string;
    private payload:any;
    private error:string;

    constructor(result:string, payload:any, error?:string) {
        this.result = result;
        this.payload = payload;
        this.error = error;
    }

    public hasError():boolean{
        return this.result=="error";
    }
    
    public getResult():string{
        return this.result;
    }
    
    public getError():string{
        return this.error;
    }
    
    public getPayload():any{
        return this.payload;
    }
}