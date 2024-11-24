import { Injectable } from '@angular/core';
import Pusher, { Channel } from 'pusher-js';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class PusherService {
  private pusher: Pusher; // Instância do Pusher
  private channel: Channel | null = null; // Canal de comunicação, pode ser null inicialmente

  constructor(private authService: AuthService) {
    // Criação da instância do Pusher com a chave da sua aplicação
    this.pusher = new Pusher('4e772f4c4673ea59fcd6', {
      cluster: 'us2', // Defina o cluster adequado ao seu projeto
    });
  }

  // Método para enviar uma mensagem
  sendMessage(chatId: string, text: string): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      const senderUid = user.uid;

      // Salvar mensagem no Firestore
      this.authService.saveMessage(chatId, senderUid, text);

      // Enviar evento para o canal Pusher
      if (this.channel) {
        this.channel.trigger('client-message', { text, senderUid, user: user.displayName });
      }
    }
  }

  // Método para se inscrever em um canal
  subscribeToChannel(channelName: string): Channel {
    if (!this.channel) {
      this.channel = this.pusher.subscribe(channelName); // Assina o canal se ainda não foi feito
      // Aqui, você pode adicionar um ouvinte para as mensagens
      this.channel.bind('client-message', (data: any) => {
        console.log('Mensagem recebida no canal', data);
      });
    }
    return this.channel; // Retorna o canal
  }

  // Método para obter o canal atual
  getChannel(): Channel | null {
    return this.channel; // Retorna o canal ou null
  }

  // Método para verificar se o canal foi assinado
  isChannelSubscribed(): boolean {
    return this.channel !== null; // Retorna true se o canal foi assinado
  }

  // Método para ouvir eventos de mensagens no canal
  listenForMessages(callback: (message: string) => void): void {
    if (this.channel) {
      this.channel.bind('client-message', (data: any) => {
        callback(data.text); // Chama o callback passando a mensagem recebida
      });
    }
  }
}
