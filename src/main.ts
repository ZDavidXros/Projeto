import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { enableProdMode } from '@angular/core';
import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import { initializeApp } from 'firebase/app';

// Verifica se o ambiente de produção está ativado e habilita o modo de produção
if (environment.production) {
  enableProdMode();
}




// Inicializa o Firebase com as configurações fornecidas no environment.ts
const app = initializeApp(environment.firebaseConfig);
console.log('Firebase foi inicializado com sucesso', app);

// Bootstrap do módulo principal
platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.log(err));
