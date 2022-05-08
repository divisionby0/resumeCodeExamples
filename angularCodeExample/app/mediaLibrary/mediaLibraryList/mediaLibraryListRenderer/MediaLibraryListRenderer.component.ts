import {Component} from "@angular/core";
import {BaseMediaLibraryListRenderer} from "../BaseMediaLibraryListRenderer";

@Component({
    selector: 'media-library-list-renderer',
    templateUrl: './MediaLibraryListRenderer.component.html',
    styleUrls: ['./MediaLibraryListRenderer.component.scss']
})
export class MediaLibraryListRenderer extends BaseMediaLibraryListRenderer{
}