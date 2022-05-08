import {ISocket} from "./ISocket";
import {Observable} from "rxjs/index";
import {SocketResponse} from "./SocketResponse";
import {GetFingerprintRequest} from "./GetFingerprintRequest";
import {concatMap} from "rxjs/internal/operators/concatMap";
export class StartSelfVideoRequestSequence {
    private socket:ISocket;
    private selfId:string;
    private name:string;
    private password:string;
    private fingerprint:string;

    constructor(socket:ISocket, selfId:string, name:string, password:string, fingerprint?:string) {
        this.socket = socket;
        this.selfId = selfId;
        this.name = name;
        this.password = password;
        this.fingerprint = fingerprint;
    }

    public execute():any{
        var that = this;

        if(!this.fingerprint){
            var getFingerprintRequest:GetFingerprintRequest = new GetFingerprintRequest();
            return getFingerprintRequest.execute().pipe(concatMap(result=>this.sendRequest(result)));
        }
        else{
            return this.sendRequest(this.fingerprint);
        }
    }

    private sendRequest(fingerprint:string):Observable<SocketResponse>{
        
        return Observable.create(observer=>{
            this.socket.canStartPublishVideo().subscribe((result:boolean)=>{
                if(result == true){

                    // second startPublish() request
                    this.socket.startPublishVideo({userId:this.selfId, name:this.selfId, password:this.password, device:fingerprint}).subscribe((startPublishResult:any)=>{
                        startPublishResult.fingerprint = fingerprint;
                        observer.next(new SocketResponse("OK", startPublishResult));
                    });
                }
                else{
                    observer.next(new SocketResponse("error", null, "Unable to start self video"));
                }
            });
        });
    }
}