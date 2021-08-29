import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';
import { SharedModule } from '../shared/shared.module';
import { SidenavComponent } from './sidenav/sidenav.component';
import { ChatModule } from '../chat/chat.module';
import { AgenteComponent } from './agente/agente.component';
import { CreatingAgenteDialog } from './agentes-crud/creating-agente/creating-agente.dialog';
import { AgentesCrudComponent } from './agentes-crud/agentes-crud.component';
import { SetAgenteComponent } from './agentes-crud/set-agente/set-agente.component';
import { InicioComponent } from './inicio/inicio.component';
import { DeleteAgenteDialog } from './agentes-crud/delete-agente/delete-agente.dialog';
import { StartUiComponent } from './agente/start-ui/start-ui.component';
import { StartTipoComponent } from './agente/start-ui/start-tipo/start-tipo.component';
import { StartFrasesComponent } from './agente/start-ui/start-frases/start-frases.component';
import { EntityTypesComponent } from './agente/entity-types/entity-types.component';
import { EntityTypeComponent } from './agente/entity-types/entity-type/entity-type.component';
import { EntityComponent } from './agente/entity-types/entity-type/entity/entity.component';
import { EditEntityComponent } from './agente/entity-types/entity-type/edit-entity/edit-entity.component';
import { IntentsComponent } from './agente/intents/intents.component';
import { CurrentIntentComponent } from './agente/intents/current-intent/current-intent.component';
import { TrainingPhrasesComponent } from './agente/intents/current-intent/training-phrases/training-phrases.component';
import { PhraseItemComponent } from './agente/intents/current-intent/training-phrases/phrase-item/phrase-item.component';
import { PhraseParamsFormComponent } from './agente/intents/current-intent/training-phrases/phrase-params-form/phrase-params-form.component';
import { IntentHeaderComponent } from './agente/intents/current-intent/intent-header/intent-header.component';
import { DeleteIntentDialog } from './agente/intents/current-intent/delete-intent/delete-intent.dialog';
import { PartParameterComponent } from './agente/intents/current-intent/training-phrases/part-parameter/part-parameter.component';
import { AddEntityTypeComponent } from './agente/entity-types/entity-type/add-entity-type/add-entity-type.component';
import { ParametersComponent } from './agente/intents/current-intent/parameters/parameters.component';
import { AddParameterComponent } from './agente/intents/current-intent/parameters/add-parameter/add-parameter.component';
import { EntityTypeSelectorComponent } from './agente/entity-types/entity-type-selector/entity-type-selector.component';
import { ParamValueComponent } from './agente/intents/current-intent/parameters/param-value/param-value.component';
import { ParamRowComponent } from './agente/intents/current-intent/parameters/param-row/param-row.component';
import { ParamSelectorComponent } from './agente/intents/current-intent/parameters/param-selector/param-selector.component';
import { ResponsesComponent } from './agente/intents/current-intent/responses/responses.component';
import { ResponseItemComponent } from './agente/intents/current-intent/responses/response-item/response-item.component';
import { SearchResponseFormComponent } from './agente/intents/current-intent/responses/search-response-form/search-response-form.component';
import { DefaultResponseFormComponent } from './agente/intents/current-intent/responses/default-response-form/default-response-form.component';
import { ConditionalResponseFormComponent } from './agente/intents/current-intent/responses/conditional-response-form/conditional-response-form.component';
import { CatchResponseFormComponent } from './agente/intents/current-intent/responses/catch-response-form/catch-response-form.component';
import { CardResponseComponent } from './agente/intents/current-intent/responses/card-response/card-response.component';
import { AddIntentDialog } from './agente/intents/add-intent/add-intent.dialog';
import { ContextsComponent } from './agente/contexts/contexts.component';
import { ContextSelectorComponent } from './agente/contexts/context-selector/context-selector.component';
import { AddContextDialog } from './agente/contexts/add-context/add-context.dialog';
import { TextResponseComponent } from './agente/intents/current-intent/responses/text-response/text-response.component';
import { SuggestResponseComponent } from './agente/intents/current-intent/responses/suggest-response/suggest-response.component';
import { IntentListComponent } from './agente/intents/intent-list/intent-list.component';
import { AddContextComponent } from './agente/contexts/add-context/add-context.component';
import { ContextItemComponent } from './agente/contexts/context-item/context-item.component';
import { ConfigComponent } from './agente/config/config.component';
import { FallbackComponent } from './agente/config/fallback/fallback.component';
import { CallContactComponent } from './agente/config/call-contact/call-contact.component';
import { DefaultIntentsComponent } from './agente/config/default-intents/default-intents.component';
import { InteractionsComponent } from './agente/interactions/interactions.component';
import { IntegrationsComponent } from './agente/integrations/integrations.component';
import { MessengerIntegrationComponent } from './agente/integrations/messenger-integration/messenger-integration.component';
import { WhatsappIntegrationComponent } from './agente/integrations/whatsapp-integration/whatsapp-integration.component';
import { QRCodeModule } from 'angularx-qrcode';


@NgModule({
  declarations: [
    DashboardComponent,
    SidenavComponent,
    AgenteComponent,
    CreatingAgenteDialog,
    AgentesCrudComponent,
    SetAgenteComponent,
    InicioComponent,
    DeleteAgenteDialog,

    StartUiComponent,
    StartTipoComponent,
    StartFrasesComponent,

    EntityTypesComponent,
    EntityTypeComponent,
    EntityComponent,
    EditEntityComponent,

    IntentsComponent,
    CurrentIntentComponent,
    TrainingPhrasesComponent,
    PhraseItemComponent,
    PhraseParamsFormComponent,
    IntentHeaderComponent,
    DeleteIntentDialog,
    PartParameterComponent,
    AddEntityTypeComponent,

    ParametersComponent,
    AddParameterComponent,
    EntityTypeSelectorComponent,
    ParamValueComponent,
    ParamRowComponent,
    ParamSelectorComponent,
    ResponsesComponent,
    ResponseItemComponent,
    SearchResponseFormComponent,
    DefaultResponseFormComponent,
    ConditionalResponseFormComponent,
    CatchResponseFormComponent,
    CardResponseComponent,
    AddIntentDialog,
    ContextsComponent,
    ContextSelectorComponent,
    AddContextDialog,
    TextResponseComponent,
    SuggestResponseComponent,
    IntentListComponent,
    AddContextComponent,
    ContextItemComponent,
    ConfigComponent,
    FallbackComponent,
    CallContactComponent,
    DefaultIntentsComponent,
    InteractionsComponent,
    IntegrationsComponent,
    MessengerIntegrationComponent,
    WhatsappIntegrationComponent,
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    SharedModule,
    ChatModule,
    QRCodeModule
  ]
})
export class DashboardModule { }
