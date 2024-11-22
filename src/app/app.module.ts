import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';

// Firebase Imports
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { AngularFireStorageModule } from '@angular/fire/compat/storage';
import { AngularFireAnalyticsModule } from '@angular/fire/compat/analytics';
import { AngularFireMessagingModule } from '@angular/fire/compat/messaging';
import { AngularFireFunctionsModule } from '@angular/fire/compat/functions';

// Importando a configuração do Firebase do environment.ts
import { environment } from '../environments/environment';
import { AuthService } from './services/auth.service';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    // Inicializando Firebase com a configuração do environment
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFireAuthModule,        // Autenticação
    AngularFirestoreModule,       // Firestore
    AngularFireStorageModule,     // Armazenamento
    AngularFireAnalyticsModule,   // Analytics
    AngularFireMessagingModule,   // Cloud Messaging
    AngularFireFunctionsModule    // Funções em nuvem
  ],
  providers: [
    AuthService,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
