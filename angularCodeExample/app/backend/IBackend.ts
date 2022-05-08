import {HttpResponse, HttpClient} from "@angular/common/http";
import {Observable} from "rxjs/index";
import {ILadiesBackendCollection} from "./ILadiesBackendCollection";
export interface IBackend extends ILadiesBackendCollection{
    setSelfId(id:string):void;
    setSessionId(id:string):void;
    authenticate(login: string, password: string): Observable<HttpResponse<string>>;
    login(login: string): Observable<HttpResponse<string>>;
    getCurrentUserInfo(login: string): Observable<HttpResponse<string>>;
    getMe(login: string): Observable<HttpResponse<string>>;
    
    // TODO вызовы http сокет методов перенесены cюда, это нелогично. Все же, мы обращается к сокету а не к backend. Впоследствии перенести их отсюда в socket
    sendClientLogToSocketServerRoute(data:string):Observable<Object>;
    testSocketHttpMethod():Observable<Object>;
    onBlockInvitation(corrId:string):Observable<Object>;
    onCloseInvitation(corrId:string):Observable<Object>;
    onReadInvitation(corrId:string):Observable<Object>;
    
    //closeInvitation(corrId:string):Observable<HttpResponse<string>>;
    removeContact(correspondentUser: string): Observable<HttpResponse<string>>;
    addToFavourites(correspondentUser: string): Observable<HttpResponse<string>>;
    removeFromFavourites(correspondentUser: string): Observable<HttpResponse<string>>;
    
    getSingleContactMan(onlineContactLogin: string): Observable<HttpResponse<string>>;

    setCamStatus(status: boolean): Observable<HttpResponse<string>>;

    endChat(participantId: string): Observable<HttpResponse<string>>;

    getSmilesCategories(): Observable<HttpResponse<string>>;
    getSmilesPage(startPosition: number, count: number): Observable<HttpResponse<string>>;
    getSmilesFromCategory(categoryId:string): Observable<HttpResponse<string>>;
    getStickersCategories(): Observable<HttpResponse<string>>;
    getAllStickers(start: number, count: number, retrieveCount: boolean): Observable<HttpResponse<string>>;
    getStickersFromCategory(stickerCategoryId:string): Observable<HttpResponse<string>>;
    getStickerDetail(stickerId:number): Observable<HttpResponse<string>>;

    startChat( corrId:string):Observable<HttpResponse<any>>;
    chatLog(senderData:string, companion:string, dateTime:string, message:string): Observable<HttpResponse<string>>;

    savePreview(imgData:string):any;
}