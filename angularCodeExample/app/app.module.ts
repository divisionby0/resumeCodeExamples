import {NgModule } from '@angular/core';
import {BrowserModule } from '@angular/platform-browser';
import {CdkAccordionModule} from '@angular/cdk/accordion';
import {AppComponent } from './app.component';
import {HeaderComponent } from './header/header/header.component';
import {FooterComponent } from './footer/footer/footer.component';
import {ConversationComponent } from './conversation/conversation/conversation.component';
import {ContactsService} from "./contacts/contacts.service";
import {SortContactsPipe} from "./contacts/sort/sortContacts.pipe";
import {SocketService} from "./socket/socket.service";
import {BackendService} from "./backend/backend.service";
import {DialogService} from "./modal/dialog.service";
import {HttpClient, HttpClientModule} from "@angular/common/http";
import {ConversationService} from "./conversation/conversation.service";
import {InvitationsService} from "./messages/invitations/invitations.service";
import {TextChatService} from "./messages/textchat/text-chat/text-chat.service";
import {SoundService} from "./sound/sound.service";
import {MessagesService} from "./messages/messages.service";
import {StreamingServiceMock} from "./debug/streaming/StreamingServiceMock";
import {DialogComponent} from "./modal/dialog/dialog.component";
import {OnlineStateComponent } from './avatars/online-state/online-state.component';
import {BackendServiceMock} from "./debug/mocks/backend/BackendServiceMock";
import {LoggingService} from "./logging/logging.service";
import {SocketServiceMock} from "./debug/mocks/backend/SocketServiceMock";
import {ApplicationService} from "./application.service";
import {InfoService} from "./info/InfoService";
import {environment} from "../environments/environment";
import {StreamingService} from "./streaming/streaming.service";
import {InsertableMediaService} from "./messages/textchat/insertables/InsertableMediaService";
import {EmojisPipe} from "./utils/emojis.pipe";
import {SelfButtonsBlockService} from "./buttons/self-buttons-block/SelfButtonsBlockService";
import {SelfBalanceService} from "./badges/balanceBadge/SelfBalanceService";
import {SocketLogSenderService} from "./socket/SocketLogSenderService";
import {CookieService} from "./cookie/cookie.service";
import {MediaLibraryBackend} from "./mediaLibrary/backend/MediaLibraryBackend";
import {LadiesMediaLibraryService} from "./mediaLibrary/LadiesMediaLibraryService";
import {MediaLibrarySocketService} from "./mediaLibrary/socket/MediaLibrarySocketService";
import {ISelectedBoughtMediaProvider} from "./mediaLibrary/ISelectedBoughtMediaProvider";
import {AllUserMediaCollection} from "./mediaLibrary/AllUserMediaCollection";
import {SimilarMediaService} from "./mediaLibrary/boughtMedia/SimilarMediaService";
import {IMediaActions} from "./mediaLibrary/IMediaActions";
import {MarketingService} from "./marketing/MarketingService";
import {MarketingBackend} from "./marketing/backend/MarketingBackend";
import {StatisticsService} from "./stats/StatisticsService";

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    ConversationComponent,
    // rest of components
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    ScrollingModule,
    VirtualScrollerModule,
    CdkAccordionModule
  ],
  providers: [
    CookieService,
    LoggingService,
    InfoService,
    HttpClient,
    MediaLibraryBackend,
    {provide:"IMediaUrlProvider", useExisting:MediaLibraryBackend},
    MediaLibrarySocketService,
    AllUserMediaCollection,
    LadiesMediaLibraryService,
    {provide: 'ISelectedMediaProvider', useExisting: LadiesMediaLibraryService},
    {provide: 'ISelectedBoughtMediaProvider', useExisting: LadiesMediaLibraryService},
    {provide: 'IUserMediaByCodeProvider', useExisting: LadiesMediaLibraryService},
    {provide: 'IUserMediaParser', useExisting: LadiesMediaLibraryService},
    {provide: 'IMediaActions', useExisting: LadiesMediaLibraryService},
    {provide: 'IPreviewActions', useExisting: LadiesMediaLibraryService},
    {provide: 'ILadyUnboughtMediaProvider', useExisting: LadiesMediaLibraryService},
    SimilarMediaService,
    MarketingService,
    MarketingBackend,
    SocketLogSenderService,
    DialogService,
    SelfBalanceService,
    MessagesService,
    ContactsService,
    {provide: 'IContactNameProvider', useExisting: ContactsService},
    {provide: 'IContactRemover', useExisting: ContactsService},
    {provide: 'ICurrentContact', useExisting: ContactsService},
    {provide: 'ISelfContact', useExisting: ContactsService},
    {provide: 'IContactByIdProvider', useExisting: ContactsService},
    ConversationService,
    {provide: 'ISelfDataProvider', useExisting: ConversationService},
    {provide: 'IRemoteContactProvider', useExisting: ConversationService},
    InvitationsService,
    FavIconService,
    TextChatService,
    {provide: 'IConversationTypeStartedEventReceiver', useExisting: TextChatService},
    {provide: 'IMediaOfferReceiver', useExisting: TextChatService},
    SoundService,
    SortContactsPipe,
    RemoteButtonsBlockService,
    SelfButtonsBlockService,
      // SOCKET SERVICE DI
    { provide: "socketService", useFactory: ()=>{
      if(environment.mockSocket == true){
        return new SocketServiceMock();
      }
      else if(environment.mockSocket == false){
        return new SocketService();
      }
    }},
    {provide: 'ISocket', useExisting: "socketService"},
    {provide: 'IConnectionFailedSubjectProvider', useExisting: "socketService"},
      // BACKEND SERVICE DI
    { provide: "backendService", useFactory: (http: HttpClient)=>{
      if(environment.mockBackend == true){
        return new BackendServiceMock();
      }
      else if(environment.mockBackend == false){
        return new BackendService(http);
      }
    }, deps:[HttpClient]},
    {provide: 'IBackend', useExisting: "backendService"},
    {provide: 'ILadiesBackendCollection', useExisting: "backendService"},
    // STREAMING SERVICE DI with ConversationService as DI on constructor
    { provide: "streamingService", useFactory: (selfDataProvider:ConversationService, infoService:InfoService)=>{
      if(environment.remoteStreamer == false){
        return new StreamingServiceMock(selfDataProvider);
      }
      else if(environment.remoteStreamer == true){
        return new StreamingService(selfDataProvider, infoService);
      }
    },deps:[ConversationService, InfoService]},

    {provide: 'IStreamingService', useExisting: 'streamingService'},
    {provide: 'IActiveMediaSubscriptionsProvider', useExisting: 'streamingService'},
    InsertableMediaService,
    {provide: 'IIMessageTextTransform', useExisting: InsertableMediaService},
    ApplicationService,
    EmojisPipe,
    StatisticsService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
