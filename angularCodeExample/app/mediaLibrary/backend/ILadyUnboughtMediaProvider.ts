import {Observable} from "rxjs/index";
export interface ILadyUnboughtMediaProvider {
    getLadyUnboughtMedia(customerId:string, ladyId:string):Observable<any>;
}