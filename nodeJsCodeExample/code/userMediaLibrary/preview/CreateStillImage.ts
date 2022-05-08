import {Observable} from "rxjs";
import {UPLOADED_VIDEOS_PATH} from "../../constants/config.constants";
import {AppLogger} from "../../services/logging/AppLogger";
declare function require(data:any):any;
export class CreateStillImage {

    private tmpFolder:string;

    constructor(tmpFolder:string) {
        this.tmpFolder = tmpFolder;
    }

    public execute(fileName:string):Observable<any>{
        return Observable.create(observer=>{
            const sourcePath:string = "";
            const jpgFileName:string = "";
            const targetPathJpg:string = UPLOADED_VIDEOS_PATH + jpgFileName;

            const {spawn} = require('child_process');
            const ffmpegConvertToJpg = spawn(
                'ffmpeg', 
                [
                    // / hidden data
                ]
            );

            ffmpegConvertToJpg.stderr.on('data', (data) => {
                // hidden
            });

            ffmpegConvertToJpg.on('close', (code) => {
                
                if(code == 0){
                    observer.next({result:"OK", ...});
                }
                else{
                    observer.next({result:"ERROR", error:"FFMPEG create still image result code is not 0"});
                }
            });
        });
    }
    private getClassName():string{
        return this.constructor.toString().match(/\w+/g)[1];
    }

    private log(data:any):void{
        AppLogger.getInstance().log(data, this.getClassName());
    }
}