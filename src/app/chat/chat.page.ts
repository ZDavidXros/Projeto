import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PusherService } from '../services/pusher.service';
import { AuthService } from '../services/auth.service';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import firebase from 'firebase/compat/app';  // Certifique-se de usar esta importação.
import 'firebase/compat/firestore';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit {
  messages: any[] = [];
  newMessage: string = '';
  matchId: string | null = null;
  channel: any;
  
  

  constructor(
    private activatedRoute: ActivatedRoute,
    private pusherService: PusherService,
    public authService: AuthService,  // Alterado para public
    private firestore: AngularFirestore
  ) {}

  


  ngOnInit() {
    this.activatedRoute.paramMap.subscribe(params => {
      this.matchId = params.get('matchId');
      if (this.matchId) {
        this.loadMessages();
      }
    });
  }

  get currentUser() {
    return this.authService.getCurrentUser();
  }

  loadMessages() {
    if (!this.matchId) {
      console.error('Match ID não definido.');
      return;
    }

    this.channel = this.pusherService.subscribeToChannel(this.matchId);

    this.channel.bind('client-message', (data: any) => {
      this.messages.push({ user: data.user, text: data.text });
    });

    this.firestore.collection('chats')
      .doc(this.matchId)
      .collection('messages', ref => ref.orderBy('timestamp'))
      .valueChanges()
      .subscribe(messages => {
        this.messages = messages;
      });
  }

  async sendMessage(): Promise<void> {
    if (!this.newMessage.trim() || !this.matchId) {
      console.error('Mensagem vazia ou Match ID inválido.');
      return;
    }

    const currentUser = this.currentUser;
    if (!currentUser) {
      console.error('Usuário não autenticado.');
      return;
    }

    // Substituindo o timestamp para usar o horário local
    const messageData = {
      text: this.newMessage,
      userId: currentUser.uid,
      timestamp: new Date().toISOString(),  // Usando a data e hora local
    };

    try {
      console.log('Enviando mensagem para Firestore:', messageData);

      await this.firestore.collection('chats')
        .doc(this.matchId)
        .collection('messages')
        .add(messageData);

      console.log('Mensagem salva no Firestore');

      if (this.channel) {
        this.channel.trigger('client-message', {
          text: this.newMessage,
          user: currentUser.uid,
        });
        console.log('Mensagem enviada via Pusher');
      }

      this.messages.push({ user: currentUser.uid, text: this.newMessage });

      this.newMessage = '';
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    }
  }

  handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.sendMessage();
    }
  }
}
