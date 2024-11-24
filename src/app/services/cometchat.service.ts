import { Injectable } from '@angular/core';
import { CometChat } from '@cometchat-pro/chat';
import { environment } from '../../environments/environment';
import { AuthService } from '../services/auth.service'; // Ajuste conforme necessário
import { UserData } from '../services/auth.service'; // Ajuste conforme necessário

@Injectable({
  providedIn: 'root'
})
export class CometchatService {
  private isLoggingIn = false;
  constructor(private authService: AuthService) {}


  // Método para fazer login ou criar usuário no CometChat
  createOrLoginUserInCometChat(): Promise<CometChat.User> {
    const currentUserUid = this.authService.getCurrentUser()?.uid;
  
    if (!currentUserUid) {
      return Promise.reject('Usuário não autenticado');
    }
  
    if (this.isLoggingIn) {
      console.log('Login já em progresso, por favor aguarde...');
      return Promise.reject('Login em progresso');
    }
  
    this.isLoggingIn = true;
  
    return CometChat.login(currentUserUid, environment.cometChatConfig.authKey)
      .then(() => {
        console.log('Usuário logado no CometChat com o authKey:', currentUserUid);
        return CometChat.getUser(currentUserUid);
      })
      .then(user => {
        console.log('Usuário encontrado no CometChat:', user);
        this.isLoggingIn = false;
        return user;
      })
      .catch(error => {
        if (error.code === 'ERR_USER_NOT_FOUND') {
          console.log('Usuário não encontrado no CometChat, criando usuário...');
          const user = new CometChat.User(currentUserUid);
          user.setName('Nome do Usuário');  // Defina o nome real, que pode ser obtido do Firestore
          CometChat.createUser(user, environment.cometChatConfig.authKey)
          .then((createdUser) => {
              console.log('Usuário criado:', createdUser);
              // Verifique se o usuário foi criado antes de tentar o login
              return CometChat.getUser(currentUserUid);
          })
          .then(userData => {
              console.log('Usuário encontrado no CometChat:', userData);
              // Tente o login após garantir que o usuário foi encontrado
              return CometChat.login(currentUserUid, environment.cometChatConfig.authKey);
          })
          .then(() => {
              console.log('Login bem-sucedido');
          })
          .catch(error => {
              console.error('Erro ao criar ou fazer login no CometChat:', error);
          });
      
      
        }
  
        this.isLoggingIn = false;
        throw error;
      })
  }

  isConversationExists(currentUserUid: string, matchUid: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      // Verifica a conversa com o usuário matchUid
      CometChat.getConversation(matchUid, 'user').then((conversation: CometChat.Conversation) => {
        // Se a conversa for retornada, significa que ela já existe
        resolve(conversation != null);
      }).catch((error: any) => {
        reject(error); // Caso ocorra erro ao buscar a conversa
      });
    });
  }


  // Método para obter o UID do usuário atual
  getCurrentUserUid(): string | null {
    return this.authService.getCurrentUser()?.uid || null;
  }

  /**
   * Inicializa o CometChat com as configurações do ambiente.
   * Retorna uma Promise<void> para garantir controle de inicialização.
   */
  initializeCometChat(): Promise<void> {
    return CometChat.init(
      environment.cometChatConfig.appID,
      new CometChat.AppSettingsBuilder()
        .subscribePresenceForAllUsers()
        .setRegion(environment.cometChatConfig.region)
        .build()
    )
    .then(() => {
      console.log('CometChat Initialized Successfully');
    })
    .catch((error) => {
      console.error('CometChat Initialization Failed', error);
      throw error; // Garante que erros sejam capturados corretamente
    });
  }

  /**
   * Faz o login no CometChat com o UID do usuário.
   * @param uid UID do usuário no CometChat.
  

  /**
   * Faz o logout do CometChat.
   */
  logoutUser(): Promise<Object> {
    return CometChat.logout();
  }

  loginUser(uid: string): Promise<CometChat.User> {
    return CometChat.login(uid, environment.cometChatConfig.authKey)
      .then(user => {
        console.log('Usuário logado no CometChat:', user);
        return user;
      })
      .catch(error => {
        console.error('Erro ao fazer login no CometChat:', error);
        throw error;
      });
  }
  
  /**
   * Cria ou retorna um chat privado entre dois usuários.
   * @param uid1 UID do primeiro usuário.
   * @param uid2 UID do segundo usuário.
   */
  createPrivateChatRoom(uid1: string, uid2: string): Promise<CometChat.Group> {
    const chatRoomId = this.createPrivateChatRoomId(uid1, uid2);
    const group = new CometChat.Group(chatRoomId, 'Private Chat', CometChat.GROUP_TYPE.PRIVATE, '');

    return CometChat.createGroup(group)
      .then((createdGroup) => createdGroup)
      .catch((error) => {
        if (error?.code === 'ERR_ALREADY_EXISTS') {
          // Grupo já existe, então retorna ele
          return CometChat.getGroup(chatRoomId);
        }
        throw error; // Outros erros são lançados
      });
  }

  /**
   * Gera um ID único para o chat privado com base nos UIDs dos usuários.
   * IDs são gerados em ordem alfabética para evitar duplicatas.
   * @param uid1 UID do primeiro usuário.
   * @param uid2 UID do segundo usuário.
   */
  private createPrivateChatRoomId(uid1: string, uid2: string): string {
    return uid1 < uid2 ? `${uid1}_${uid2}` : `${uid2}_${uid1}`;
  }

  /**
   * Carrega todas as conversas do usuário logado.
   * @param limit Quantidade máxima de conversas a buscar.
   */
  loadConversations(limit = 50): Promise<CometChat.Conversation[]> {
    const conversationsRequest = new CometChat.ConversationsRequestBuilder()
      .setLimit(limit)
      .build();

    return conversationsRequest.fetchNext();
  }

  /**
   * Envia uma mensagem de texto para outro usuário.
   * @param receiverUid UID do destinatário.
   * @param text Texto da mensagem.
   */
  sendMessage(receiverUid: string, text: string): Promise<CometChat.BaseMessage> {
    const message = new CometChat.TextMessage(
      receiverUid,
      text,
      CometChat.RECEIVER_TYPE.USER
    );

    return CometChat.sendMessage(message); // Retorna uma Promise com tipo BaseMessage
  }

  // Método para criar chats para os matches
  createChatsForMatches(matches: UserData[]): Promise<CometChat.Group[]> {
    const currentUserUid = this.getCurrentUserUid(); // Use o método que chama o AuthService
    
    if (!currentUserUid) {
      return Promise.reject('Usuário não autenticado');
    }
    
    const chatPromises = matches.map(match => {
      // Chama diretamente o método `createPrivateChatRoom` sem 'cometchatService'
      return this.createPrivateChatRoom(currentUserUid, match.uid);
    });

    return Promise.all(chatPromises);
  }

  // Método que inicializa o CometChat, faz o login e carrega as conversas
  initializeAndLoadConversations(): Promise<CometChat.Conversation[]> {
    const currentUserUid = this.getCurrentUserUid();
    
    if (!currentUserUid) {
      return Promise.reject('Usuário não autenticado');
    }

    return this.initializeCometChat()
      .then(() => this.loginUser(currentUserUid))
      .then(() => this.loadConversations()) // Após o login, carrega as conversas
      .catch(error => {
        console.error('Erro ao inicializar o CometChat ou carregar conversas:', error);
        throw error;
      });
  }
}
