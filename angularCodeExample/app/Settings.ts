import {ISettingsProvider} from "./ISettingsProvider";
export class Settings implements ISettingsProvider{
    
    private static instance: Settings;

    public static PRODUCTION:string = "PRODUCTION";
    public static TESTING:string = "TESTING";

    private currentMode:string = Settings.TESTING;
    
    private currentUserId:string ="-1";
    private currentUserType:string = "unset";
    private logToConsole:boolean = true;
    
    // app log file path
    private logFile:string = "app.log";

    private localDebug:boolean = false;
    //private localDebugWithoutButtons:boolean = false;

    private version:string = "...";

    public static getInstance(): Settings {
        if (!Settings.instance) {
            Settings.instance = new Settings();
        }
        return Settings.instance;
    }

    private constructor() {}
    
    public setVersion(value:string):void{
        this.version = value;
    }
    public getVersion():string{
        return this.version;
    }
    
    public setCurrentMode(value:string):void{
        this.currentMode = value;
    }

    public setCurrentUserId(value:string):void{
        this.currentUserId = value;
    }
    public getCurrentUserId():string{
        return this.currentUserId;
    }
    
    public setCurrentUserType(userType:string):void{
        this.currentUserType = userType;
    }
    public getCurrentUserType():string{
        return this.currentUserType;
    }
    
    public getCurrentMode():string{
        return this.currentMode;
    }

    public isDebugging():boolean{
        return this.currentMode == Settings.TESTING;
    }
    
    public setIsLocalDebug(value:boolean):void{
        this.localDebug = value;
    }
    public isLocalDebugging():boolean{
        return this.localDebug;
    }
    
    public getLogFile():string{
        return this.logFile;
    }
    
    public setLogToConsole(value:boolean):void{
        this.logToConsole = value;
    }
    public isLogToConsole():boolean{
        return this.logToConsole;
    }
}