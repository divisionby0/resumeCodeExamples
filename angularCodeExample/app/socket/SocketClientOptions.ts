import {Settings} from "../Settings";
import {SocketConstants} from "../constants/SocketConstants";
export class SocketClientOptions {
    private login:string;
    private sessionId:string;
    private browserName:string;
    private audioPublishState:string;
    private videoPublishState:string;
    private subscribeState:string;

    constructor(login:string, sessionId:string, browserName:string, audioPublishState:string, videoPublishState:string, subscribeState:string) {
        this.login = login;
        this.sessionId = sessionId;
        this.browserName = browserName;
        this.audioPublishState = audioPublishState;
        this.videoPublishState = videoPublishState;
        this.subscribeState = subscribeState;
    }
    
    public getConfig():any{
        // polling only
        return {
            transports:['polling'],
            'reconnection': true,
            'reconnectionDelay': SocketConstants.SOCKET_CLIENT_RECONNECTION_DELAY,
            'reconnectionDelayMax' : SocketConstants.SOCKET_CLIENT_RECONNECTION_DELAY_MAX,
            'reconnectionAttempts': SocketConstants.SOCKET_CLIENT_MAX_RECONNECTION_ATTEMPTS,
            query: {
                userId: this.login,
                timezone: new Date().getTimezoneOffset() * 60 * 1000,
                sessionId: this.sessionId,
                browserName: this.browserName,
                mediaStates:JSON.stringify({audioPublishState:this.audioPublishState, videoPublishState:this.videoPublishState, subscribeState:this.subscribeState}),
                appVer:Settings.getInstance().getVersion()
            },
            path: SocketConstants.SOCKET_SERVER_PATH + "..."
        };
    }
}