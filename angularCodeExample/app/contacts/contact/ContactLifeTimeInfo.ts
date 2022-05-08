export class ContactLifeTimeInfo {
    private message:string;
    private rest:any[];

    constructor(message:string, rest?:any) {
        this.message = message;
        this.rest = rest;
    }
    
    public getMessage():string{
        return this.message;
    }
    
    public hasRestData():boolean{
        if(this.rest){
            return true;
        }
        else{
            return false;
        }
    }
    
    public getRestData():any{
        return this.rest;
    }
}