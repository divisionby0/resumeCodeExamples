import {Component, OnInit} from "@angular/core";
import {BaseMediaLibraryList} from "./BaseMediaLibraryList";
@Component({
    selector: 'ladies-media-library-list',
    templateUrl: './LadiesMediaLibraryList.component.html',
    styleUrls: ['./LadiesMediaLibraryList.component.scss']
})
export class LadiesMediaLibraryList extends BaseMediaLibraryList{

    protected getClassName():string{
        return "LadiesMediaLibraryList";
    }
}