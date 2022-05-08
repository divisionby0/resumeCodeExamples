import {Observable} from "rxjs";
import {AppLogger} from "../../services/logging/AppLogger";
declare var require:any;
const { Sequelize, DataTypes, Op} = require('sequelize');
export class UserMediaDbModel {
    private userMediaDbModel:any;

    constructor(sequelize:any) {
        this.createModel(sequelize);
    }

    private createModel(sequelize:any):void{
        // METHOD CONTENT HIDDEN IN DEMO CODE
    }

    public create(type:number, userId:string, url:string, cost:number):Observable<any>{
        this.log("create");
        const that = this;
        return Observable.create(observer=>{
            const createObject:any = {
                // hidden object
            };

            this.userMediaDbModel.create(
                createObject
            ).then((data:any)=>{
                if(data){
                    observer.next({result:"OK", ...});
                }
                else{
                    that.log("create user media error "+data.error);
                    observer.next({result:"Error", error:data.error});
                }
            }).catch(error=>{
                that.log("create user media error "+error);
                observer.next({result:"Error", error:error});
            });
        });
    }
    
    public remove(mediaId:number):Observable<any>{
        return Observable.create(observer=>{
            const condition:any = {
                // hidden object
            };
            this.getUserMediaById(mediaId).subscribe(mediaToRemoveData=>{
                this.userMediaDbModel.destroy(condition).then(data=>{
                    if(data){
                        // METHOD CONTENT HIDDEN IN DEMO CODE
                    }
                    else{
                        // METHOD CONTENT HIDDEN IN DEMO CODE
                    }
                }).catch(error=>{
                    observer.next({result:"Error removing template",error:error});
                });
            });
        });
    }

    // METHOD CONTENT HIDDEN IN DEMO CODE
    public setStillUrl(mediaId:number, url:string):Observable<any>{
        return Observable.create(observer=>{
            // hidden
        });
    }

    // METHOD CONTENT HIDDEN IN DEMO CODE
    public getAllMedia():Observable<any>{
        // hidden
    }
    public getUserMedia(userId:number):Observable<any>{
        const condition:any = {
            // hidden data
        };
        return Observable.create(observer=>{
            this.userMediaDbModel.findAll({
                // hidden data
            }).then(data=>{
                if(data){
                    // METHOD CONTENT HIDDEN IN DEMO CODE
                }
                else{
                    // METHOD CONTENT HIDDEN IN DEMO CODE
                }
            });
        });
    }
    public getUserMediaUrl(mediaId:number):Observable<any>{
        const condition:any = {
            // hidden data
        };
        return Observable.create(observer=>{
            this.userMediaDbModel.findOne({
                // hidden data
            }).then(data=>{
                if(data){
                    // METHOD CONTENT HIDDEN IN DEMO CODE
                }
                else{
                    // METHOD CONTENT HIDDEN IN DEMO CODE
                }
            });
        });
    }

    public getUserMediaById(mediaId:number):Observable<any>{
        const condition:any = {
            // hidden data
        };
        return Observable.create(observer=>{
            this.userMediaDbModel.findOne({
                // hidden data
            }).then(data=>{

                const returnData:any = {};
                for (const [key, value] of Object.entries(data.dataValues)) {
                    returnData[key] = value;
                }
                returnData.bought = false;
                returnData.url = "hidden";
                
                if(data){
                    observer.next({result:"OK", ...});
                }
                else{
                    observer.next({result:"ERROR", error:"Undefined answer on get user media by mediaId "+mediaId});
                }
            });
        });
    }
    
    public getUserMediaExceptIDs(exceptIDs:number[]):Observable<any>{
        return Observable.create(observer=>{
            const condition:any = {
                // hidden data
            };
            
            if(exceptIDs && exceptIDs.length > 0){
                condition.where = {
                    id: {
                        [Op.notIn]: exceptIDs
                    }
                }
            }

            condition.attributes = [
                // hidden data
            ];

            this.userMediaDbModel.findAll(condition).then(data=>{
                if(data){
                    observer.next({result:"OK", ...});
                }
                else{
                    observer.next({result:"ERROR", error:"Undefined answer on get user media except IDs "+JSON.stringify(exceptIDs)});
                }
            });
        });
    }
    
    public getConcreteLadyUserMediaExceptIDs(ladyId:number, exceptIDs:number[]):Observable<any>{
        return Observable.create(observer=>{
            const condition:any = {
                // hidden data
            };

            if(exceptIDs && exceptIDs.length > 0){
                condition.where = {
                    id: {
                        [Op.notIn]: exceptIDs
                    },
                    userId: {
                        [Op.eq]:ladyId
                    }
                }
            }
            else{
                condition.where = {
                    userId: {
                        [Op.eq]:ladyId
                    }
                }
            }

            condition.attributes = [
                // hidden data
            ];

            this.userMediaDbModel.findAll(condition).then(data=>{
                if(data){
                    // METHOD CONTENT HIDDEN IN DEMO CODE
                }
                else{
                    observer.next({result:"ERROR", error:"Undefined answer on get concrete lady "+ladyId+" user media except IDs "+JSON.stringify(exceptIDs)});
                }
            });
        });
    }

    private getClassName():string{
        return this.constructor.toString().match(/\w+/g)[1];
    }

    private log(data:any):void{
        AppLogger.getInstance().log(data, this.getClassName());
    }

}