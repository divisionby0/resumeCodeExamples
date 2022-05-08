import {Observable} from "rxjs";
import {AppLogger} from "../../services/logging/AppLogger";
declare function require(data:any):any;
export class GetVideoProperties {
    constructor() {
    }
    
    public execute(filePath:string):Observable<any>{
        return Observable.create(observer=>{

            this.log("getting video properties ...");
            
            const {spawn} = require('child_process');
            let duration:number;

            // ffprobe -i D:/workspaces/DenverServers/home/dreamonlove3/dolserver/public/uploads/videos/1649323106309.mp4.mp4 -v quiet -show_entries format=duration -hide_banner -of default=noprint_wrappers=1:nokey=1
            
            const ffmpegGetVideoProperties = spawn(
                'ffprobe',
                [
                    // hidden data
                ]);

            ffmpegGetVideoProperties.stderr.on('data', (data) => {
                this.log("err ffmpegGetVideoProperties:" + data);
            });

            ffmpegGetVideoProperties.stdout.on('data', (data) => {
                if(!isNaN(data)){
                    duration = Math.floor(parseInt(data));
                    this.log("video duration: "+duration);
                }
            });

            ffmpegGetVideoProperties.on('close', (code) => {
                this.log("get video properties closed with code "+code);
                if(code == 0){
                    const data:any = {result:"OK", ...};
                    observer.next(data);
                }
                else{
                    observer.next({result:"ERROR", error:"FFMPEG get video properties result code is not 0"});
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