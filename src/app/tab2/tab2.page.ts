import { Component, OnInit, Input } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { ChatService } from '../services/chat.service';
import { Router } from '@angular/router';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { getFirestore, serverTimestamp } from 'firebase/firestore';

@Component({
  selector: 'app-tab2',
  templateUrl: './tab2.page.html',
  styleUrls: ['./tab2.page.scss'],
})
export class Tab2Page implements OnInit {
  @Input() user: any;
  matches: any[] = [];
  currentUserUid: string = ''; // Variável para armazenar o UID do usuário logado

  constructor(
    private authService: AuthService,
    private chatService: ChatService,
    private router: Router
  ) {}

  ngOnInit() {
    // Obtenha o UID do usuário logado
    this.currentUserUid = sessionStorage.getItem('userUid')!; // ou use authService se for necessário
    this.loadMatches();
  }

  loadMatches() {
    this.authService.getUserMatches().then(matches => {
      this.matches = matches;
    }).catch(error => {
      console.error('Erro ao carregar os matches:', error);
    });
  }

  startChatWithMatch(match: any) {
    if (!match.uid) {
      console.error('Match inválido, UID não encontrado');
      return;
    }

    // Gerar o chatId baseado nos dois usuários
    const chatId = this.getChatId(this.currentUserUid, match.uid);
    console.log('ID do chat gerado:', chatId);

    // Chama o serviço para criar ou obter o canal
    this.chatService.createOrGetChannel(chatId).then(channel => {
      console.log('Canal de chat iniciado com o match:', match);
      // Navegar para a tela de chat passando o chatId correto
      this.router.navigate(['/tabs/chat', { matchId: chatId }]); // Aqui você passa o chatId gerado
    }).catch(error => {
      console.error('Erro ao iniciar chat:', error);
    });
  }

  getChatId(user1: string, user2: string): string {
    return [user1, user2].sort().join('-'); // Garante que o chatId seja único e consistente entre os dois usuários
  }
}
