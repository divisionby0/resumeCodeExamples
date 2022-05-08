export class UserMediaUtil {
    
    public static parsePreview(code:string):string{
        const parts:string[] = code.split("&");
        return parts[2];
    }
    public static parseId(code:string):number{
        const parts:string[] = code.split("&");
        return parseInt(parts[1]);
    }
    
    public static isUserMedia(content:string):boolean{
        if(content.indexOf('UserMedia')!=-1){
            return true;
        }
        else{
            return false;
        }
    }
}