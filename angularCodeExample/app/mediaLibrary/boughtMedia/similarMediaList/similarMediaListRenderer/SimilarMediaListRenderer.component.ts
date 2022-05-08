import {Component, Output, EventEmitter} from "@angular/core";
import {MediaLibraryListRenderer} from "../../../mediaLibraryList/mediaLibraryListRenderer/MediaLibraryListRenderer.component";
import {BuyMediaConfirmable} from "../../../BuyMediaConfirmable";
import {IUserMedia} from "../../../media/IUserMedia";
import {LadiesMediaLibraryService} from "../../../LadiesMediaLibraryService";
@Component({
    selector: 'similar-media-list-renderer',
    templateUrl: './SimilarMediaListRenderer.component.html',
    styleUrls: ['./SimilarMediaListRenderer.component.scss']
})
export class SimilarMediaListRenderer extends MediaLibraryListRenderer{
    constructor(private service:LadiesMediaLibraryService){
        super(service);
    }

    @BuyMediaConfirmable()
    public onBuySimilarMedia(parameters:any) {

        // TODO в DOM-е уже нет similar list-а, некому получить мои события - обращаемся напрямую к сервису
        this.service.buyMedia((parameters.media as IUserMedia));
    }
}