import {BackendResponseParser} from "./BackendResponseParser";
import {UserType} from "../../contacts/UserType";
import {BackendResponse} from "../BackendResponse";
import {Contact} from "../../contacts/contact/Contact";
export class SelfContactParser extends BackendResponseParser {

    public parse(balance?:number):any{
        if(this.data && this.data.body){
            return new BackendResponse("...", // rest data);
        }
        else{
            return new BackendResponse("error",null, "...");
        }
    }
}