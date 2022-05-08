import {UserMediaLibrary} from "./UserMediaLibrary";
import {UPLOADED_VIDEOS_BASE_URL} from "../constants/config.constants";
import {AppLogger} from "../services/logging/AppLogger";
export class UserMediaLibraryAPI {
    constructor(router:any, videoUploader:any, userMediaLibrary:UserMediaLibrary) {

        router.post('/methodName', videoUploader.single('video'), (req, res) => {
            if(req.file) {
                const fileName:string = req.file.filename;
                const videoUrl:string = UPLOADED_VIDEOS_BASE_URL + fileName;
                const userId:string = req.body.userId;
                const type:number = req.body.type;
                const cost:number = req.body.cost;
                
                userMediaLibrary.methodName(type, userId, videoUrl, cost, fileName).subscribe(data=>{
                    this.log("upload video result: "+JSON.stringify(data));
                    res.status(200).send(data).end();
                });
            }
            else {
                this.log("ERROR upload video ");
                res.status(200).send("ERROR").end();
            }
        });

        router.post('/methodName', (req: any, res: any) => {
            const mediaId: number = req.body.mediaId ? req.body.mediaId : null;

            if(mediaId){
                userMediaLibrary.methodName(mediaId).subscribe(data=>{
                    res.status(200).send(data).end();
                });
            }
            else{
                userMediaLibrary.methodName(mediaId).subscribe(data=>{
                    this.log("detect preview ready result: "+JSON.stringify(data));
                    res.status(200).send({result:"ERROR", error:"No mediaId provided"}).end();
                });
            }
        });

        router.post('/methodName', (req: any, res: any)=>{
            const userId: number = req.body.userId;


            if(userId){
                userMediaLibrary.methodName(userId).subscribe(data=>{
                    res.status(200).send(data).end();
                });
            }
            else{
                res.status(200).send({result:"ERROR", error:"No userId provided"}).end();
            }
        });
        router.post('/methodName', (req: any, res: any)=>{
            const adminId:number = req.body.adminId;
            
            if(adminId){
                userMediaLibrary.methodName(adminId).subscribe(data=>{
                    res.status(200).send(data).end();
                });
            }
            else{
                res.status(200).send({result:"ERROR", error:"No adminId provided"}).end();
            }
        });
        router.post('/methodName', (req: any, res: any)=>{
            const mediaId: number = req.body.mediaId;
            
            if(mediaId){
                userMediaLibrary.methodName(mediaId).subscribe(data=>{
                    res.status(200).send(data).end();
                });
            }
            else{
                res.status(200).send({result:"ERROR", error:"No userId provided"}).end();
            }
        });
        
        router.post('/methodName', (req: any, res: any)=>{
            const mediaId: number = req.body.mediaId;
            
            if(mediaId){
                userMediaLibrary.methodName(mediaId).subscribe(data=>{
                    res.status(200).send(data).end();
                });
            }
            else{
                res.status(200).send({result:"ERROR", error:"No mediaId provided"}).end();
            }
        });
        router.post('/methodName', (req: any, res: any)=>{
            const mediaId: number = req.body.mediaId;

            if(mediaId){
                userMediaLibrary.methodName(mediaId).subscribe(data=>{
                    res.status(200).send(data).end();
                });
            }
            else{
                res.status(200).send({result:"ERROR", error:"No mediaId provided"}).end();
            }
        });

        router.post('/methodName', (req: any, res: any)=>{
            const mediaId: number = req.body.mediaId;
            const customerId:number = parseInt(req.body.customerId);
            if(mediaId){
                userMediaLibrary.methodName(mediaId, customerId).subscribe(data=>{
                    res.status(200).send(data).end();
                });
            }
            else{
                res.status(200).send({result:"ERROR", error:"No either mediaId or customerId provided"}).end();
            }
        });

        router.post('/methodName', (req: any, res: any)=>{
            const mediaId: number = req.body.mediaId;
            
            if(mediaId){
                userMediaLibrary.methodName(mediaId).subscribe(data=>{
                    res.status(200).send(data).end();
                });
            }
            else{
                res.status(200).send({result:"ERROR", error:"No mediaId provided"}).end();
            }
        });

        router.post('/methodName', (req: any, res: any)=>{
            const mediaId: number = req.body.mediaId;

            if(mediaId){
                userMediaLibrary.methodName(mediaId).subscribe(data=>{
                    res.status(200).send(data).end();
                });
            }
            else{
                res.status(200).send({result:"ERROR", error:"No mediaId provided"}).end();
            }
        });
        
        router.post('/methodName', (req: any, res: any)=>{
            const mediaId: number = req.body.mediaId;
            const customerId: number = req.body.customerId;

            if(mediaId && customerId){
                userMediaLibrary.methodName(mediaId, customerId).subscribe(data=>{
                    this.log("buy media response: "+JSON.stringify(data));
                    res.status(200).send(data).end();
                });
            }
            else{
                res.status(200).send({result:"ERROR", error:"No mediaId or customerId provided"}).end();
            }
        });
        
        router.post('/methodName', (req: any, res: any)=>{
            const customerId: number = req.body.customerId;

            if(customerId){
                userMediaLibrary.methodName(customerId).subscribe(data=>{
                    res.status(200).send(data).end();
                });
            }
            else{
                res.status(200).send({result:"ERROR", error:"No customerId provided"}).end();
            }
        });
        router.post('/methodName', (req: any, res: any)=>{
            const customerId: number = parseInt(req.body.customerId);
            const ladyId: number = parseInt(req.body.ladyId);
            
            if(customerId && ladyId){
                userMediaLibrary.methodName(customerId, ladyId).subscribe(data=>{
                    res.status(200).send(data).end();
                });
            }
            else{
                res.status(200).send({result:"ERROR", error:"No customerId or ladyId provided"}).end();
            }
        });
        
        router.post('/methodName', (req: any, res: any)=>{
            const customerId: number = req.body.customerId;

            if(customerId){
                userMediaLibrary.methodName(customerId).subscribe(data=>{
                    res.status(200).send(data).end();
                });
            }
            else{
                res.status(200).send({result:"ERROR", error:"No customerId provided"}).end();
            }
        });

        router.post('/methodName', (req: any, res: any)=>{
            const mediaId: number = req.body.mediaId;
            const customerId: number = req.body.customerId;

            if(mediaId){
                userMediaLibrary.methodName(mediaId, customerId).subscribe(data=>{
                    res.status(200).send(data).end();
                });
            }
            else{
                res.status(200).send({result:"ERROR", error:"No mediaId provided"}).end();
            }
        });
        
        
        router.post('/methodName', (req: any, res: any)=>{
            const productId: number = req.body.productId;
            const leadId: number = req.body.leadId;

            if(productId && leadId){
                userMediaLibrary.methodName(productId, leadId).subscribe(data=>{
                    res.status(200).send(data).end();
                });
            }
            else{
                res.status(200).send({result:"ERROR", error:"No mediaId provided"}).end();
            }
        });
        router.post('/methodName', (req: any, res: any)=>{
            const productId: number = req.body.productId;
            if(productId){
                userMediaLibrary.methodName(productId).subscribe(data=>{
                    res.status(200).send(data).end();
                });
            }
            else{
                res.status(200).send({result:"ERROR", error:"No mediaId provided"}).end();
            }
        });
    }

    private getClassName():string{
        return this.constructor.toString().match(/\w+/g)[1];
    }

    private log(data:any):void{
        AppLogger.getInstance().log(data, this.getClassName());
    }
}