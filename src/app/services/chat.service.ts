import { Injectable } from '@angular/core';
import { PusherService } from './pusher.service'; // Criamos esse serviço de Pusher
import { AuthService } from './auth.service'; // Serviço do usuário

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  constructor(
    private pusherService: PusherService,
    private authService: AuthService
  ) {}

  // Método para criar ou acessar um canal de chat para o match
  async createOrGetChannel(matchUid: string): Promise<any> {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      const channelName = this.getChannelName(currentUser.uid, matchUid);
      return this.pusherService.subscribeToChannel(channelName);
    }
    throw new Error('Usuário não autenticado');
  }

  // Função para gerar o nome único do canal baseado nos uids dos usuários
  private getChannelName(userId1: string, userId2: string): string {
    // O nome do canal pode ser algo como "match-user1-user2"
    return [userId1, userId2].sort().join('-');
  }

  // Enviar mensagem para o canal
  sendMessage(channel: any, message: string): void {
    channel.trigger('client-message', { text: message });
  }
}
