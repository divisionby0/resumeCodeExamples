export class UserMediaCodeParser {
    
    constructor() {
    }
    
    public static parseId(code:string):number{
        let idString:string = code.replace("[UserMedia=","");
        return parseInt(idString.replace("]",""));
    }
}