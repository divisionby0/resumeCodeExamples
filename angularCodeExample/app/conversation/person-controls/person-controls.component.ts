import {Component, OnInit, Input, OnChanges, SimpleChanges} from '@angular/core';
import {ConversationType} from "../ConversationType";
import {UserType} from "../../contacts/UserType";

@Component({
  selector: 'app-person-controls',
  templateUrl: './person-controls.component.html',
  styleUrls: ['./person-controls.component.scss']
})
export class PersonControlsComponent implements OnInit, OnChanges {
  public cssClass:string[];
  private baseCssClass:string = "buttonsWrapper";
  private personHasTextCssClass:string = "personHasText";
  private personHasAudioCssClass:string = "personHasAudio";

  @Input() public userType:string = UserType.UNDEFINED;

  @Input() public hasText:boolean = false;
  @Input() public hasAudio:boolean = false;
  @Input() public hasVideo:boolean = false;

  constructor() {
    this.createBaseCss();
  }

  public ngOnInit(): void {
  }

  public ngOnChanges(changes:SimpleChanges):void {

    if(this.userType == UserType.UNDEFINED){
      this.createBaseCss();
      // remove all buttons
    }

    // text chat IS active during audio chat
    if(this.hasAudio == true){
      this.createAudioChatCss();
    }
    else if(this.hasVideo == true){

    }
    else if(this.hasText == true){
      this.createTextChatCss()
    }
    else{
      this.createBaseCss();
    }
  }

  private createBaseCss():void{
    this.cssClass = new Array(this.baseCssClass);
  }

  private createTextChatCss():void{
    this.cssClass = new Array(this.baseCssClass, this.personHasTextCssClass);
  }
  private createAudioChatCss():void{
    this.cssClass = new Array(this.baseCssClass, this.personHasAudioCssClass);
  }
}
