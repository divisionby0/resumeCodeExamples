import {Subject} from "rxjs/index";
export interface IConnectionFailedSubjectProvider{
    getConnectionFailedSubject():Subject<void>;
}
