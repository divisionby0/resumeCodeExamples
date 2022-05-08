import {Observable} from "rxjs/index";
import {OutgoingMediaVO} from "../../streaming/OutgoingMediaVO";
export interface IContactMediaState{
    setOutgoingAudioState(data:OutgoingMediaVO):void;
    getOutgoingAudioState():OutgoingMediaVO;
    getOutgoingAudioChangedListener():Observable<OutgoingMediaVO>;

    setOutgoingVideoState(data:OutgoingMediaVO):void;
    getOutgoingVideoState():OutgoingMediaVO;
    getOutgoingVideoChangedListener():Observable<OutgoingMediaVO>;
}