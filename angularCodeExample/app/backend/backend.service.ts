import {Injectable} from "@angular/core";
import {HttpClient, HttpHeaders, HttpParams, HttpResponse} from "@angular/common/http";
import {Observable} from "rxjs/index";
import {AppConstants} from "../constants/AppConstants";
import {AppEvent} from "../AppEvent";
import {EventBus} from "../lib/events/EventBus";
import {LoginRequest} from "./request/LoginRequest";
import {GetCurrentUserInfoRequest} from "./request/GetCurrentUserInfoRequest";
import {GetLadiesRequest} from "./request/GetLadiesRequest";
import {environment} from "../../environments/environment";
import {BaseBackendRequest} from "./request/BaseBackendRequest";
import {IBackend} from "./IBackend";
import {ILadiesBackendCollection} from "./ILadiesBackendCollection";

@Injectable()
export class BackendService implements IBackend, ILadiesBackendCollection{
  private sessionId: string;
  private selfId:string;

  public constructor(private http: HttpClient) {
  }
  public setSelfId(id:string):void {
    this.selfId = id;
  }

  public setSessionId(id:string):void {
    this.sessionId = id;
  }

  public login(login: string): Observable<HttpResponse<string>> {
    var request:BaseBackendRequest;

    request = new LoginRequest(this.http);
    return request.execute({login:login, sessionId:this.sessionId});
  }

  public getCurrentUserInfo(login: string): Observable<HttpResponse<string>> {
    var request:GetCurrentUserInfoRequest = new GetCurrentUserInfoRequest(this.http);
    return request.execute({login:login, sessionId:this.sessionId});
  }

  public getContactsLadies(): Observable<HttpResponse<string>> {
    var request:GetLadiesRequest = new GetLadiesRequest(this.http);
    return request.execute({login:this.selfId, sessionId:this.sessionId});
  }
  public getSingleContactMan(onlineContactLogin: string): Observable<HttpResponse<string>> {
    const random = Math.random() * 10000;
    const params = new HttpParams(); // hidden data
    return this.http.get(environment.backendUrl + environment.backendApi, {
      withCredentials: AppConstants.WITH_CREDENTIALS,
      params: params,
      observe: "response",
      responseType: "text"
    });
  }
  
  public savePreview(imgData:string):any{
    const body = {
      "userId" : this.selfId,
      "gifData" : imgData
    };
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type":  "application/json"
      })
    };
    return this.http.post(AppConstants.SAVE_GIF_URL, JSON.stringify(body), httpOptions);
  }

  public removeContact(correspondentUser: string): Observable<HttpResponse<string>> {
    const random = Math.random() * 10000;
    const params = new HttpParams(); // hidden data
    return this.http.get(environment.backendUrl + environment.backendApi, {
      withCredentials: AppConstants.WITH_CREDENTIALS,
      params: params,
      observe: "response",
      responseType: "text"
    });
  }

  public addToFavourites(correspondentUser: string): Observable<HttpResponse<string>> {
    const random = Math.random() * 10000;
    const params = new HttpParams(); // hidden data
    return this.http.get(environment.backendUrl + environment.backendApi, {
      withCredentials: AppConstants.WITH_CREDENTIALS,
      params: params,
      observe: "response",
      responseType: "text"
    });
  }
  public removeFromFavourites(correspondentUser: string): Observable<HttpResponse<string>> {
    const random = Math.random() * 10000;
    const params = new HttpParams(); // hidden data
    return this.http.get(environment.backendUrl + environment.backendApi, {
      withCredentials: AppConstants.WITH_CREDENTIALS,
      params: params,
      observe: "response",
      responseType: "text"
    });
  }
  
  public setMood(login:string, mood:number):Observable<HttpResponse<string>>{
    const random = Math.random() * 10000;
    const params = new HttpParams(); // hidden data

    return this.http.get(environment.backendUrl + environment.backendApi, {
      withCredentials: AppConstants.WITH_CREDENTIALS,
      params: params,
      observe: "response",
      responseType: "text"
    });
  }
  
  public log(value:any, ...rest:any[]):void{
    EventBus.dispatchEvent(AppEvent.SEND_LOG, {className:this.getClassName(), value:value, rest:rest});
  }

  private getClassName():string{
    return "BackendService";
  }
}
