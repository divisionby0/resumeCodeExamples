import {VideoPreviewBuilder} from "./preview/VideoPreviewBuilder";
import {MySQLService} from "../services/db/MySQLService";
import {Observable} from "rxjs";
import {AppLogger} from "../services/logging/AppLogger";
import {UPLOADED_VIDEOS_BASE_URL, UPLOADED_MEDIA_PREFIX_PATH, APP_BASE_PATH} from "../constants/config.constants";
import {VideoConverter} from "./VideoConverter";
import {LOCAL_DEBUG, BACKEND_URL, BACKEND_API_ENDPOINT, APP_VERSION} from "../constants/api.constants";
import {BuyUserMediaPayRequestDebug} from "./request/BuyUserMediaPayRequestDebug";
import {User} from "../models/user/User";
import {ChatManagerService} from "../services/chat-manager.service";
import {PayRequest} from "../services/superagent/request/PayRequest";
import {PayResponse} from "../services/superagent/PayResponse";
import {Man} from "../models/user/man/Man";
import {EventBus} from "../lib/events/EventBus";
import {UserMediaEvent} from "./UserMediaEvent";
import {UserMediaLibraryErrorCode} from "./UserMediaLibraryErrorCode";
import {BuyUserMediaPayRequest} from "./request/BuyUserMediaPayRequest";
import {IUserByIdProvider} from "../services/IUserByIdProvider";

declare function require(data:any):any;
const fs = require('fs');

export class UserMediaLibrary {
    private dbService:MySQLService;
    private videoPreviewBuilder:VideoPreviewBuilder = new VideoPreviewBuilder();
    private videoConverter:VideoConverter = new VideoConverter();
    private queue:any[] = [];

    private userProvider:IUserByIdProvider;

    constructor() {
    }
    
    public setDbService(dbService:MySQLService):void{
        this.dbService = dbService;
    }

    public setUserProvider(userProvider:IUserByIdProvider):void{
        this.userProvider = userProvider;
    }

    public addMedia(type:number, userId:string, url:string, cost:number, fileName:string):Observable<any>{
        return Observable.create(observer=>{

            this.dbService.createUserMedia(type, userId, url, cost).subscribe(data=>{
                observer.next({result:"OK", ...});

                this.addQueueTask(data.id, type, userId, url, cost, fileName);
            });
        });
    }
    
    public removeMedia(mediaId:number):Observable<any>{
        return Observable.create(observer=>{

            this.dbService.boughtMediaExists(mediaId).subscribe(data=>{
                const exists:boolean = data.exists;
                
                if(exists){
                    observer.next({result:"ERROR", errorCode:UserMediaLibraryErrorCode.CANNOT_REMOVE_MEDIA_BECAUSE_OF_HAS_BEEN_BOUGHT, error:"Media "+mediaId+" has been bought by somebody. Cannot remove."});
                }
                else{
                    this.dbService.removeUserMedia(mediaId).subscribe(data=>{
                        this.log("Media db record remove response:" + JSON.stringify(data));
                        observer.next({result:"OK", data:data});

                        EventBus.dispatchEvent(UserMediaEvent.USER_MEDIA_REMOVED, mediaId);

                        const fileToRemove:string = APP_BASE_PATH + data.removedMedia.userMedia.url;
                        const previewToRemove:string = APP_BASE_PATH + data.removedMedia.userMedia.previewUrl;
                        const stillImageToRemove:string = APP_BASE_PATH + data.removedMedia.userMedia.stillUrl;

                        fs.unlink(fileToRemove, (removeMediaError) => {
                            if (removeMediaError) {
                                this.log("Error remove user media file: "+removeMediaError);
                                return;
                            }
                            else{
                                this.log("removing media "+mediaId+" preview "+previewToRemove);
                                fs.unlink(previewToRemove, (removeMediaPreviewError) => {
                                    if (removeMediaPreviewError) {
                                        this.log("Error remove user media preview : "+removeMediaPreviewError);
                                        return;
                                    }
                                    else{
                                        this.log("removing media "+mediaId+" still image "+stillImageToRemove);
                                        fs.unlink(stillImageToRemove, (removeMediaStillImageError) => {
                                            if (removeMediaStillImageError) {
                                                this.log("Error remove user media still image: "+removeMediaStillImageError);
                                                return;
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    });
                }
            });
        });
    }
    
    public detectPreviewReady(mediaId:number):Observable<any>{
        return this.dbService.hasPreview(mediaId);
    }
    
    public getUserMedia(userId:number):Observable<any>{
        return this.dbService.getUserMedia(userId);
    }
    public getAllMedia(adminId:number):Observable<any>{
        // METHOD CONTENT HIDDEN IN DEMO CODE
    }
    
    public getUserMediaUrl(mediaId:number):Observable<any>{
        return this.dbService.getUserMediaUrl(mediaId);
    }
    public getUserMediaTotalPurchases(mediaId:number):Observable<any>{
        return this.dbService.getUserMediaTotalPurchases(mediaId);
    }
    public getUserMediaPurchases(mediaId:number):Observable<any>{
        return this.dbService.getUserMediaPurchases(mediaId);
    }
    public detectUserMediaBoughtBy(mediaId:number, customerId:number):Observable<any>{
        return this.dbService.detectUserMediaBoughtBy(mediaId, customerId);
    }
    
    public getUserMediaPreview(mediaId:number):Observable<any>{
        return Observable.create(observer=>{
            
        });
    }

    public methodName(mediaId:number, customerId:number):Observable<any>{
        return Observable.create(observer=>{
            this.dbService.getUserMediaById(mediaId).subscribe(data=>{
                
                if(data.result == "OK"){
                    const userMedia:any = data.userMedia;
                    const cost:number = userMedia.cost;
                    const mediaOwnerId:number = userMedia.userId;

                    const customer:User = ChatManagerService.getInstance().getUser(customerId.toString());

                    if(!customer){
                        observer.next({result:"ERROR", ...});
                    }

                    this.dbService.detectPurchaseExists(mediaId, customerId).subscribe(data=>{
                        const purchaseExists:boolean = data.exists;

                        if(!purchaseExists){
                            this.createMediaPayment(cost, mediaOwnerId, customer).subscribe(paymentResponseData=>{
                                if(paymentResponseData.result == "OK"){

                                    this.createPurchaseDBRecord(mediaId, customerId).subscribe(dbCreatePurchaseData=>{
                                        if(dbCreatePurchaseData.result == "OK"){

                                            observer.next(dbCreatePurchaseData);
                                        }
                                        else{
                                            observer.next(dbCreatePurchaseData);
                                        }
                                    });
                                }
                                else{
                                    observer.next(paymentResponseData);
                                }
                            });
                        }
                        else{
                            observer.next({result:"ERROR", ...});
                        }
                    });
                }
                else{
                    observer.next(data);
                }
            });
        });
    }
    
    public getBoughtMedia(customerId:number):Observable<any>{
        return this.dbService.getMediaByCustomerId(customerId);
    }
    
    public getUnboughtMedia(customerId:number):Observable<any>{
        this.log("getUnboughtMedia customerId="+customerId);
        return Observable.create(observer=>{
            this.dbService.getBoughtMediaIDs(customerId).subscribe(data=>{
                this.log("getBoughtMediaIDs data:"+JSON.stringify(data));
                const boughtMediaIDs:any[] = data.collection;
                const ids:number[] = [];

                if(boughtMediaIDs){
                    boughtMediaIDs.map(item=>{
                        ids.push(item.mediaId);
                    })
                }
                this.log("exception ids:"+JSON.stringify(ids));

                this.dbService.getUserMediaExceptIDs(ids).subscribe(unboughtUserMediaData=>{
                    observer.next(unboughtUserMediaData);
                });
            });
        });
    }
    
    public getLadyUnboughtMedia(customerId:number, ladyId:number):Observable<any>{
        // METHOD CONTENT HIDDEN IN DEMO CODE
    }
    
    public getUserMediaById(mediaId:number, customerId?:number):Observable<any>{
        this.log("getUserMediaById mediaId="+mediaId+" customerId="+customerId);
        return this.dbService.getUserMediaById(mediaId, customerId);
    }

    public detectUserMediaBought(mediaId:number, customerId:number):Observable<any>{
        return this.dbService.detectUserMediaBought(mediaId, customerId);
    }
    
    public previewReviewed(productId:number, leadId:number):Observable<any>{
        return this.dbService.previewReviewed(productId, leadId);
    }
    public getPreviewReviews(productId:number):Observable<any>{
        return this.dbService.getPreviewReviews(productId);
    }

    private addQueueTask(mediaId:number, type:number, userId:string, url:string, cost:number, fileName:string):void{
        this.log("adding queue task to create preview. mediaId:"+mediaId+" url:"+url);
        this.queue.push({mediaId:mediaId, type:type, userId:userId, url:url, cost:cost, fileName:fileName});
        this.nextTask();
    }
    
    private nextTask():void{
        const firstTask:any = this.queue[0];
        if(firstTask){
            this.convertVideoToPM4(firstTask.mediaId, firstTask.fileName).subscribe(data=>{
                const result:string = data.result;
                this.log("convert video response: "+JSON.stringify(data));

                if(result == "OK"){
                    const srcFilePath:string = data.srcFilePath;
                    const convertedFileName:string = data.convertedFileName;
                    const duration:number = data.duration;

                    const cost:number = this.generateCost(duration);

                    // TODO update db record with new url
                    this.log("set media "+firstTask.mediaId+" url to "+UPLOADED_VIDEOS_BASE_URL + convertedFileName);
                    this.dbService.setUserMediaUrl(firstTask.mediaId, UPLOADED_VIDEOS_BASE_URL + convertedFileName).subscribe(data=>{
                        this.log("set user media url response: " + JSON.stringify(data));
                    });
                    
                    // TODO remove uploaded
                    fs.unlink(srcFilePath, (removeMediaError) => {
                        if (removeMediaError) {
                            this.log("Error remove user media file: "+removeMediaError);
                        }
                        else{
                            this.log("Uploaded file "+srcFilePath+"removed");
                        }
                    });

                    // TODO rest actions
                    this.createVideoPreview(firstTask.mediaId, convertedFileName).subscribe(data=>{
                        this.log("create video preview result: "+JSON.stringify(data));

                        // todo update db
                        const previewUrl:string = UPLOADED_VIDEOS_BASE_URL+data.preview;
                        const stillImageUrl:string = UPLOADED_VIDEOS_BASE_URL+data.stillImage;
                        
                        this.dbService.updateMediaProperties(firstTask.mediaId, previewUrl, stillImageUrl, duration, cost).subscribe(data=>{
                            this.log("update media "+firstTask.mediaId+" properties response: "+JSON.stringify(data));
                            
                            this.dbService.getUserMediaById(firstTask.mediaId).subscribe(data=>{
                                if(data.result == "OK"){
                                    const media:any = data.userMedia;
                                    EventBus.dispatchEvent(UserMediaEvent.USER_MEDIA_ADDED, media);
                                }
                            });
                            
                            this.removeTask(firstTask.mediaId);
                            this.nextTask();
                        });
                    });
                }
                else{
                    // METHOD CONTENT HIDDEN IN DEMO CODE
                }
            });
        }
        else{
            this.log("all tasks complete");
        }
    }
    
    private createMediaPayment(cost:number, mediaOwnerId:number, customer:User):Observable<any>{
        // METHOD CONTENT HIDDEN IN DEMO CODE
    }
    
    private createPurchaseDBRecord(mediaId, customerId):Observable<any>{
        return Observable.create(observer=>{
            this.dbService.createPurchase(mediaId, customerId).subscribe(purchaseResponse=>{
                if(purchaseResponse.result == "OK"){
                    this.log("purchase created at "+purchaseResponse.date);

                    observer.next({result:"OK", ...});

                }
                else{
                    observer.next(purchaseResponse);
                }
            });
        });
    }
    
    private removeTask(mediaId:number):void{
        this.log("removing task "+mediaId);

        this.queue = this.queue.filter(item=>{
            return item.mediaId!=mediaId;
        });
    }

    private convertVideoToPM4(mediaId:number, fileName:string):Observable<any>{
        // METHOD CONTENT HIDDEN IN DEMO CODE
    }

    private createVideoPreview(mediaId:number, fileName:string):Observable<any>{
        // METHOD CONTENT HIDDEN IN DEMO CODE
    }

    private generateCost(duration:number):number{
        // METHOD CONTENT HIDDEN IN DEMO CODE
    }

    private getClassName():string{
        return this.constructor.toString().match(/\w+/g)[1];
    }

    private log(data:any):void{
        AppLogger.getInstance().log(data, this.getClassName());
    }
}