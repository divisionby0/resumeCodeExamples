export class BaseRequestResult {
    protected result:any;
    protected error:string;

    constructor(result:any, error?:string ) {
        this.result = result;
        this.error = error;
    }

    public isError():boolean{
        if(this.error){
            return true;
        }
        else{
            return false;
        }
    }
    public getError():string{
        return this.error;
    }

    public getResult():any{
        return this.result;
    }
}