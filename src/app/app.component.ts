import { Component } from '@angular/core';
import { CometChat } from "@cometchat-pro/chat";
import { environment } from '../environments/environment';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(private authService: AuthService, private router: Router) 
  {
    this.initializeCometChat();
  }
  ngOnInit() {
    this.authService.user$.subscribe((user) => {
      if (user) {
        // Redireciona apenas se o usuário estiver logado e acessando a página de login
        this.router.navigate(['/tabs']);
      }
    });
  }
  
  initializeCometChat() {
    const appID = environment.cometChatConfig.appID;     // ID do seu aplicativo
    const region = environment.cometChatConfig.region;   // Região do CometChat
    const authKey = environment.cometChatConfig.authKey; // Chave de autenticação

    const appSetting = new CometChat.AppSettingsBuilder().setRegion(region).build();

    CometChat.init(appID, appSetting).then(
      () => {
        console.log("CometChat foi inicializado com sucesso");
      },
      (error) => {
        console.log("Erro ao inicializar o CometChat:", error);
      }
    );
  }
}
