import {UPLOADED_VIDEOS_PATH} from "../constants/config.constants";
declare function require(data:any):any;
export class VideoUploader {
    private static instance: VideoUploader;

    public static getInstance(): VideoUploader {
        if (!VideoUploader.instance) {
            VideoUploader.instance = new VideoUploader();
        }
        return VideoUploader.instance;
    }

    private constructor() {
    }

    private uploader:any;
    
    public init():void{
        const imagesMulter:any = require('multer');
        const imagesStorage = imagesMulter.diskStorage(
            {
                destination: UPLOADED_VIDEOS_PATH,
                filename: function ( req, file, cb ) {
                    let ext = file.originalname.substring(file.originalname.lastIndexOf('.'), file.originalname.length);
                    cb( null, Date.now()+ext);
                }
            }
        );
        this.uploader = imagesMulter( { storage: imagesStorage } );
    }

    public getUploader():any{
        return this.uploader;
    }
}