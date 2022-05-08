import {Observable} from "rxjs";
import {UPLOADED_VIDEOS_PATH, VIDEO_PREVIEW_FPS, VIDEO_PREVIEW_SIZE} from "../../constants/config.constants";
import {AppLogger} from "../../services/logging/AppLogger";
import {ClearTempFolder} from "./ClearTempFolder";
import {CreateStillImage} from "./CreateStillImage";
declare function require(data:any):any;

//declare const {spawn} = require('child_process');
export class VideoPreviewBuilder {

    private tmpFolder:string;
    private stillImageCreator:CreateStillImage;

    constructor() {
        this.tmpFolder = UPLOADED_VIDEOS_PATH+'tmp/';
        this.stillImageCreator = new CreateStillImage(this.tmpFolder);
    }
    
    public createPreview(mediaId:number, fileName:string):Observable<any>{
        return Observable.create(observer=>{

            const {spawn} = require('child_process');

            //const ffmpeg = spawn('ffmpeg', ['-i', UPLOADED_VIDEOS_PATH + fileName, '-vf', 'fps='+VIDEO_PREVIEW_FPS, sequenceTemplate]);
            
            const filePath:string = UPLOADED_VIDEOS_PATH + fileName;

            const sequenceTemplate:string = this.tmpFolder + 'out_'+fileName+'_%d.png';
            this.log("start create images sequence media id "+mediaId);
            const ffmpegCreateSequence = spawn('ffmpeg', ['-i', filePath, '-vf', 'fps='+VIDEO_PREVIEW_FPS, sequenceTemplate]);

            ffmpegCreateSequence.stderr.on('data', (data) => {
                //console.log("Std error: "+data);
                //observer.next({result:"ERROR", error:data, mediaId:mediaId});
            });

            ffmpegCreateSequence.on('close', (code) => {
                this.log("create images sequence media id "+mediaId+" closed with code "+code);
                if(code == 0){
                    this.stillImageCreator.execute(fileName).subscribe(createStillImageResponse=>{
                        if(createStillImageResponse.result =="OK"){

                            this.createAnimation(sequenceTemplate, mediaId).subscribe(data=>{
                                if(data.result == "OK"){
                                    data.mediaId = mediaId;
                                    data.fileName = fileName;
                                    data.stillImage = createStillImageResponse.stillImage;
                                    observer.next(data);
                                }
                                else{
                                    observer.next(data);
                                }
                            });
                        }
                        else{
                            observer.next(createStillImageResponse);
                        }
                    });
                }
                else{
                    observer.next({result:"ERROR", error:"FFMPEG create sequence code is not 0"});
                }
            });

        });
    }

    private createAnimation(sequenceTemplate:string, mediaId:number):Observable<any>{
        return Observable.create(observer=>{

            const {spawn} = require('child_process');

            this.log("create animation from sequence media id "+mediaId);
            
            //const previewFileName:string = fileName+"_preview.gif";
            const previewFileName:string = "preview_"+Math.round(Math.random()*99999999999)+".gif";
            //const ffmpegCreateVideo = spawn('ffmpeg', ['-f', 'image2', '-framerate', VIDEO_PREVIEW_FPS.toString(), '-i', sequenceTemplate, '-vf', 'scale='+VIDEO_PREVIEW_SIZE, UPLOADED_VIDEOS_PATH + previewFileName]);
            const ffmpegCreateVideo = spawn('ffmpeg', ['-f', 'image2', '-framerate', VIDEO_PREVIEW_FPS.toString(), '-i', sequenceTemplate, '-vf', 'scale=176:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse', UPLOADED_VIDEOS_PATH + previewFileName]);

            ffmpegCreateVideo.stderr.on('data', (data) => {
                //console.log("CREATE VIDEO FROM SEQUENCE Std error: "+data);
                //observer.next({result:"ERROR", error:data, mediaId:mediaId});
            });

            ffmpegCreateVideo.on('close', (code) => {
                this.log("create animation from sequence media id "+mediaId+" closed with code "+code);
                
                const folderCleaner:ClearTempFolder = new ClearTempFolder(this.tmpFolder);
                folderCleaner.execute();

                if(code == 0){
                    observer.next({result:"OK", preview:previewFileName});
                }
                else{
                    observer.next({result:"ERROR", error:"FFMPEG create video from sequence code is not 0"});
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