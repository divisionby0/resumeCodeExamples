export interface IBackendContactDataProvider {
    getSessionId():string;
    getId():string;
    getBrowserName():string;
    getTimezone():number;
}