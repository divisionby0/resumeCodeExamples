import {HttpClient} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {environment} from "../../../environments/environment";
import {Observable} from "rxjs/index";
import {IMediaUrlProvider} from "./IMediaUrlProvider";
import {ILadyUnboughtMediaProvider} from "./ILadyUnboughtMediaProvider";

@Injectable({
    providedIn: 'root'
})
export class MediaLibraryBackend implements IMediaUrlProvider{
    constructor(private http: HttpClient) {
    }

    public getUserMediaInfo(userId:number):Observable<any>{
        return this.http.post(environment.getUserMediaInfoUrl, {userId:userId});
    }
    
    public buyMedia(mediaId:number, customerId:string):Observable<any>{
        return this.http.post(environment.buyMediaUrl, {mediaId:mediaId, customerId:customerId});
    }

    public getBoughtMedia(customerId:string):Observable<any>{
        return this.http.post(environment.getBoughtMediaUrl, {customerId:customerId});
    }

    public getUnboughtMedia(customerId:string):Observable<any>{
        return this.http.post(environment.getUnboughtMediaUrl, {customerId:customerId});
    }
    public getLadyUnboughtMedia(customerId:string, ladyId:string):Observable<any>{
        return this.http.post(environment.getLadyUnboughtMediaUrl, {customerId:customerId, ladyId:ladyId});
    }

    public getMediaById(mediaId:number, customerId?:string):Observable<any>{
        return this.http.post(environment.getUserMediaByIdUrl, {mediaId:mediaId, customerId:customerId});
    }
    public getMediaUrl(mediaId:number):Observable<any>{
        return this.http.post(environment.getUserMediaUrlUrl, {mediaId:mediaId});
    }
    public previewReviewed(mediaId:number, customerId:string):Observable<any>{
        return this.http.post(environment.previewReviewedUrl, {productId:mediaId, leadId:customerId});
    }
}