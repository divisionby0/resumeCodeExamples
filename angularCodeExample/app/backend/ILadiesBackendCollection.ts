import {HttpResponse} from "@angular/common/http";
import {Observable} from "rxjs/index";
export interface ILadiesBackendCollection {
    getContactsLadies(): Observable<HttpResponse<string>>;
    getSingleContactLady(onlineContactLogin: string): Observable<HttpResponse<any>>;
    getMultipleLadyContacts(ids:string[]):Observable<HttpResponse<any>>;
    addLadyToContacts(correspondentUser:string): Observable<HttpResponse<string>>;
}