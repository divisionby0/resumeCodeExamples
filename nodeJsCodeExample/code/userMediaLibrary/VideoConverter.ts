import {Observable} from "rxjs";
import {UPLOADED_VIDEOS_PATH} from "../constants/config.constants";
import {AppLogger} from "../services/logging/AppLogger";
import {GetVideoProperties} from "./preview/GetVideoProperties";
declare function require(data:any):any;
export class VideoConverter {
    constructor() {
    }
    
    public convert(mediaId:number, fileName:string):Observable<any>{
        return Observable.create(observer=>{
            const {spawn} = require('child_process');
            const srcFilePath:string = UPLOADED_VIDEOS_PATH + fileName;
            const convertedFileName:string = fileName + ".mp4";
            const convertedFilePath:string = UPLOADED_VIDEOS_PATH + convertedFileName;

            const parameters:any[] = [
                // hidden
            ];

            this.log("parameters "+JSON.stringify(parameters));

            const ffmpegConvert = spawn('ffmpeg', parameters);

            ffmpegConvert.stderr.on('data', (data) => {
                this.log("video id "+mediaId+" filename "+fileName+" converting error data: "+data);
                //console.log("converter:",data);
                //observer.next({result:"ERROR", error:data, mediaId:mediaId});
            });

            ffmpegConvert.on('close', (code) => {
                this.log("convert to mp4 media id "+mediaId+" closed with code "+code);
                if(code == 0){
                    
                    const getVideoProperties:GetVideoProperties = new GetVideoProperties();
                    getVideoProperties.execute(convertedFilePath).subscribe(videoPropertiesData=>{
                        this.log("video properties response: "+JSON.stringify(videoPropertiesData));

                        const duration:number = videoPropertiesData.duration;
                        
                        const data:any = {result:"OK", ...};
                        observer.next(data);
                    });
                }
                else{
                    observer.next({result:"ERROR", error:"FFMPEG video converting result code is not 0"});
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