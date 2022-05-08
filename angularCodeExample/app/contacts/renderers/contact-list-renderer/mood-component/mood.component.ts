import {Component, Input, OnInit, OnChanges, SimpleChanges} from "@angular/core";
import {Contact} from "../../../contact/Contact";
import {Subscription} from "rxjs/index";
import {MoodProvider} from "../../../moods/MoodProvider";

@Component({
    selector: 'mood-component',
    templateUrl: './mood.component.html',
    styleUrls: ['./mood.component.scss']
})
export class MoodComponent implements OnInit, OnChanges{
    @Input() contact:Contact;

    public moodVisible:boolean = false;
    public moodIcon:string = "assets/images/moods/notSet.png";
    public moodName:string = "unset";

    private moodChangedSubscription:Subscription;

    constructor(){
    }

    public ngOnInit():void {
        if(this.contact){
            if(this.moodChangedSubscription){
                this.moodChangedSubscription.unsubscribe();
                this.moodChangedSubscription = null;
            }
            this.moodChangedSubscription = this.contact.getMoodChangedSubject().subscribe((moodValue:number)=>{
                this.onMoodChanged(moodValue);
            });

            const currentMoodValue:number = this.contact.getMood();
            this.onMoodChanged(currentMoodValue);
        }
    }

    public ngOnChanges(changes:SimpleChanges):void {
        if(this.contact){
            if(this.moodChangedSubscription){
                this.moodChangedSubscription.unsubscribe();
                this.moodChangedSubscription = null;
            }
            this.moodChangedSubscription = this.contact.getMoodChangedSubject().subscribe((moodValue:number)=>{
                this.onMoodChanged(moodValue);
            });

            const currentMoodValue:number = this.contact.getMood();
            this.onMoodChanged(currentMoodValue);
        }
    }

    private onMoodChanged(moodValue:number):void{
        if(moodValue!=-1){
            const moodData:any = MoodProvider.getInstance().getMood(moodValue);
            if(!isNaN(moodValue)){
                this.moodIcon = moodData.img;
                this.moodName = moodData.text;
                this.moodVisible = true;
            }
        }
        else{
            this.moodVisible = false;
        }
    }
}