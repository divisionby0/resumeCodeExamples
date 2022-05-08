import {KeyMap} from "../../lib/collections/KeyMap";
import {IUserMedia} from "./IUserMedia";

export class UserMediaCollection {
    private collection:KeyMap<IUserMedia[]> = new KeyMap<IUserMedia[]>("collection");
    
    constructor() {
    }
}