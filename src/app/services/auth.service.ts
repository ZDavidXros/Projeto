 import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { BehaviorSubject } from 'rxjs';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import firebase from 'firebase/compat/app'; // Certifique-se de usar esta importação.
import 'firebase/compat/firestore';  // Certifique-se de importar o Firestore aqui.


export interface UserDataWithUid extends UserData {
  uid: string;
}

export interface UserData {
  uid: string; 
  nome: string;
  dataNascimento: string;
  email: string;
  universidade: string;
  genero: string;
  celular: string;
  periodo: string;
  discord: string;
  curte: string;
  procura: string;
  joga: string;
  fotos: string[];
  biografia?: string;
  likesRecebidos?: string[];
  dislikesRecebidos?: string[];
  matches?: string[];
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private auth = getAuth();
  private userSubject: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();

  constructor(
   
    private firestore: AngularFirestore,
    private AngularFireAuth: AngularFireAuth,
    private router: Router
  ) {
    this.checkUserState();
  }



  getFirestore() {
    return this.firestore;
  }
  saveMessage(chatId: string, senderUid: string, text: string) {
    const message = {
      senderUid,
      text,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    };
    return this.firestore.collection('chats').doc(chatId).collection('messages').add(message);
  }

  // Adicione no seu AuthService
  getMessagesForMatch(matchId: string): Promise<any[]> {
    return this.firestore.collection('chats').doc(matchId).collection('messages', ref => ref.orderBy('timestamp')).get().toPromise()
      .then(querySnapshot => {
        // Verificar se querySnapshot existe antes de continuar
        if (!querySnapshot) {
          throw new Error('Nenhuma mensagem encontrada para este chat.');
        }
  
        const messages: any[] = [];
        querySnapshot.forEach(doc => {
          messages.push(doc.data());
        });
        return messages;
      })
      .catch(error => {
        console.error('Erro ao carregar mensagens:', error);
        throw error;
      });
  }
  

  // Função para carregar as mensagens do Firestore
  loadMessages(chatId: string) {
    return this.firestore
      .collection('chats')
      .doc(chatId)
      .collection('messages', ref => ref.orderBy('timestamp'))
      .valueChanges();
  }

  private checkUserState() {
    onAuthStateChanged(this.auth, (user: User | null) => {
      if (user) {
        this.userSubject.next(user);
        sessionStorage.setItem('userUid', user.uid);
      } else {
        this.userSubject.next(null);
        this.router.navigate(['/home']);
        sessionStorage.removeItem('userUid');
      }
    });
  }

  getCurrentUser(): User | null {
    return this.auth.currentUser;
  }

 

  registerUser(email: string, password: string, userData: UserData): Promise<any> {
    return this.AngularFireAuth
      .createUserWithEmailAndPassword(email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        if (user) {
          return this.firestore.collection('usuarios').doc(user.uid).set({
            nome: userData.nome,
            dataNascimento: userData.dataNascimento,
            email: userData.email,
            universidade: userData.universidade,
            genero: userData.genero,
            celular: userData.celular,
            periodo: userData.periodo,
            discord: userData.discord,
            curte: userData.curte,
            procura: userData.procura,
            joga: userData.joga,
            fotos: userData.fotos,
            uid: user.uid,  // Use o uid gerado pelo Firebase Auth
            likesRecebidos: [],
            dislikesRecebidos: [],
            matches: []
          });
        } else {
          return Promise.reject('Usuário não encontrado');
        }
      })
      .catch((error) => {
        console.error("Erro no cadastro: ", error); // Exibe o erro completo no console
        throw error;
      });
  }

  getUserMatches(): Promise<UserData[]> {
  const currentUserUid = this.getCurrentUser()?.uid;

  if (currentUserUid) {
    return this.firestore
      .collection('usuarios')
      .doc<UserData>(currentUserUid)
      .get()
      .toPromise()
      .then(doc => {
        if (doc && doc.exists) {  // Verifica se o 'doc' e o 'exists' são válidos
          const userData = doc.data(); // Pode ser 'undefined' caso não exista no Firestore
          if (userData && userData.matches) {  // Verifica se 'matches' existe em 'userData'
            return this.getMatchesFromFirestore(userData.matches); // Chama outra função para buscar os matches
          } else {
            return []; // Se não houver 'matches', retorna um array vazio
          }
        } else {
          return []; // Se o documento não existir, retorna um array vazio
        }
      })
      .catch((error) => {
        console.error('Erro ao obter matches:', error);
        throw error; // Lança o erro para ser tratado em outro lugar
      });
  }

  return Promise.reject('Usuário não encontrado');  // Caso o UID não seja encontrado
}

  
  
async createChat(user1: string, user2: string): Promise<void> {
  console.log('Entrando na função createChat');

  // Validação dos usuários
  if (!user1 || !user2) {
    console.error('Usuários inválidos para criar o chat:', user1, user2);
    return;
  }

  // Geração do ID único do chat
  const chatId = this.getChatId(user1, user2); // Assumindo que essa função retorna um ID consistente
  console.log('ID do chat gerado:', chatId);

  // Referência do documento de chat no Firestore
  const chatDocRef = this.firestore.collection('chats').doc(chatId);

  try {
    // Verifica se o chat já existe
    const chatDoc = await chatDocRef.get().toPromise();

    // Verifica se chatDoc é válido e existe
    if (chatDoc && !chatDoc.exists) {
      const chatData = {
        channelId: chatId,
        members: [user1, user2],
        // Não inclui o campo 'createdAt' ou qualquer campo de timestamp
      };

      // Cria o documento de chat
      await chatDocRef.set(chatData);
      console.log('Chat criado com sucesso!');
    } else if (chatDoc && chatDoc.exists) {
      console.log('Chat já existe:', chatId);
    }

    console.log('Criando ou verificando o chat no Firestore...');

    // Dados do chat (sem necessidade de timestamp, apenas o ID e membros)
    const chatData = {
      channelId: chatId,
      members: [user1, user2],
      // Mensagens começam como uma coleção vazia
    };

    // Criação ou atualização do documento de chat
    await chatDocRef.set(chatData, { merge: true }); // merge: true impede sobrescrever dados existentes
    console.log('Chat criado ou atualizado com sucesso!');

    // Se necessário, crie a coleção 'messages' dentro deste chat com uma mensagem inicial (opcional)
    const messagesCollectionRef = chatDocRef.collection('messages');
    
    // Criando uma mensagem inicial se necessário (exemplo simples)
    const initialMessage = {
      user: user1,
      text: 'Olá, vamos começar a conversar!',
      // Não inclui timestamp
    };
    
    // Adicionar a primeira mensagem à coleção de mensagens
    await messagesCollectionRef.add(initialMessage);
    console.log('Mensagem inicial adicionada ao chat.');

  } catch (error) {
    // Tratamento de erros
    console.error('Erro ao criar/verificar o chat:', error);
  }
}


  

  getMatchesFromFirestore(matchesUids: string[]): Promise<UserData[]> {
    return this.firestore
      .collection('usuarios')
      .ref.where('uid', 'in', matchesUids)
      .get()
      .then((querySnapshot) => {
        const matches: UserData[] = [];
        querySnapshot.forEach((doc) => {
          matches.push(doc.data() as UserData);
        });
        return matches;
      })
      .catch((error) => {
        console.error('Erro ao obter matches do Firestore:', error);
        throw error;
      });
  }

  getUserData(uid: string): Promise<UserData | null> {
    return this.firestore
      .collection('usuarios')
      .doc<UserData>(uid)
      .ref.get()
      .then((doc) => {
        if (doc && doc.exists) {
          return doc.data() as UserData;
        } else {
          return null;
        }
      })
      .catch((error) => {
        console.error('Erro ao buscar dados do usuário:', error);
        throw error;
      });
  }

  loginUser(email: string, password: string): Promise<void> {
    return this.AngularFireAuth
      .signInWithEmailAndPassword(email, password)
      .then(async (userCredential) => {
        const user = userCredential.user;
        if (user) {
          sessionStorage.setItem('userUid', user.uid);
          const userData = await this.getUserData(user.uid);
          if (userData) {
            this.router.navigate(['/tabs'], { state: { userData } });
          } else {
            throw new Error('Dados do usuário não encontrados no Firestore');
          }
        }
      })
      .catch((error) => {
        console.error('Erro ao fazer login:', error);
        throw error;
      });
  }

  logoutUser(): Promise<void> {
    return this.AngularFireAuth.signOut().then(() => {
      this.userSubject.next(null);
      sessionStorage.removeItem('userUid');
    }).catch((error) => {
      console.error('Erro ao deslogar:', error);
      throw error;
    });
  }

  updateLike(currentUserUid: string, targetUserUid: string): Promise<void> {
    return this.firestore
      .collection('usuarios')
      .doc(currentUserUid)
      .update({
        likesRecebidos: firebase.firestore.FieldValue.arrayUnion(targetUserUid),
      })
      .then(() => {
        console.log('Like adicionado');
        // Verifica se há match e cria o chat se necessário
        this.checkMatch(currentUserUid, targetUserUid);
      })
      .catch((error) => {
        console.error('Erro ao adicionar like:', error);
        throw error;
      });
  }
  
  updateDislike(currentUserUid: string, targetUserUid: string): Promise<void> {
    return this.firestore
      .collection('usuarios')
      .doc(currentUserUid)
      .update({
        dislikesRecebidos: firebase.firestore.FieldValue.arrayUnion(targetUserUid),
      })
      .then(() => {
        console.log('Dislike adicionado');
      })
      .catch((error) => {
        console.error('Erro ao adicionar dislike:', error);
        throw error;
      });
  }
  checkMatch(currentUserUid: string, targetUserUid: string): Promise<void> {
    console.log('Verificando match entre:', currentUserUid, targetUserUid); // Adicione um log para depuração
    return this.firestore
      .collection('usuarios')
      .doc(targetUserUid)
      .get()
      .toPromise()
      .then((doc) => {
        if (doc && doc.exists) {
          const targetUser = doc.data() as UserData;
          if (targetUser?.matches?.includes(currentUserUid)) {
            console.log('Match já existe. Criando chat...');
            this.createChat(currentUserUid, targetUserUid);
          } else {
            console.log('Ainda não há match. Aguardando o outro usuário dar like de volta.');
          }
        }
      })
      .catch((error) => {
        console.error('Erro ao verificar match:', error);
        throw error;
      });
  }
  
  

  async createMatch(currentUserUid: string, targetUserUid: string): Promise<void> {
    try {
      console.log('Iniciando createMatch com currentUserUid:', currentUserUid, 'e targetUserUid:', targetUserUid);
  
      const batch = this.firestore.firestore.batch();
  
      const currentUserDoc = this.firestore.collection('usuarios').doc(currentUserUid).ref;
      const targetUserDoc = this.firestore.collection('usuarios').doc(targetUserUid).ref;
  
      batch.update(currentUserDoc, {
        matches: firebase.firestore.FieldValue.arrayUnion(targetUserUid),
      });
  
      batch.update(targetUserDoc, {
        matches: firebase.firestore.FieldValue.arrayUnion(currentUserUid),
      });
  
      await batch.commit();
  
      console.log('Match criado com sucesso! Chamando createChat...');
      await this.createChat(currentUserUid, targetUserUid); // Aqui adicionamos um log!
      console.log('createChat foi chamada com sucesso!');
    } catch (error) {
      console.error('Erro em createMatch:', error);
      throw error;
    }
  }
  

  
  private getChatId(user1: string, user2: string): string {
    const chatId = [user1, user2].sort().join('-');
    console.log('ID do chat gerado (getChatId):', chatId);
    return chatId;
  }
  
  
  
}
