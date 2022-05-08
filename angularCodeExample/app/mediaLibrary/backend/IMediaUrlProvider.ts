import {Observable} from "rxjs/index";
export interface IMediaUrlProvider {
    getMediaUrl(mediaId:number):Observable<any>;
}