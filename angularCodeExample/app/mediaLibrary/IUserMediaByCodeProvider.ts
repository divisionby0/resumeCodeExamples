import {Observable} from "rxjs/index";
export interface IUserMediaByCodeProvider {
    getMediaByCode(code:string):Observable<any>;
}