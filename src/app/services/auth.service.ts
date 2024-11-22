import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';  // Certifique-se de usar AngularFirestore
import { BehaviorSubject } from 'rxjs';
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  User,
  onAuthStateChanged,
  inMemoryPersistence,
} from 'firebase/auth';

import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';


export interface UserData {
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
    private afAuth: AngularFireAuth, 
    private router: Router
  ) {
    // Verifica o estado do usuário assim que o serviço for instanciado
    this.checkUserState();
  }

  private checkUserState() {
    // Não estamos mais configurando persistência
    // Verifica o estado de autenticação do usuário
    onAuthStateChanged(this.auth, (user: User | null) => {
      if (user) {
        this.userSubject.next(user);  // Emite o usuário autenticado
        // Armazenar apenas o UID no sessionStorage
        sessionStorage.setItem('userUid', user.uid);
      } else {
        this.userSubject.next(null);  // Emite null se não estiver logado
        this.router.navigate(['/login']);  // Redireciona para a tela de login
        // Remover o UID do sessionStorage quando o usuário sair
        sessionStorage.removeItem('userUid');
      }
    });
  }

  getCurrentUser(): User | null {
    return this.auth.currentUser;
  }

  // Método para registrar usuário no Firebase Auth e salvar no Firestore
  registerUser(email: string, password: string, userData: UserData): Promise<any> {
    return this.afAuth
      .createUserWithEmailAndPassword(email, password) // Cria o usuário no Firebase Auth
      .then((userCredential) => {
        const user = userCredential.user;
        if (user) {
          // Após o sucesso na criação do usuário, vamos salvar os dados no Firestore
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
          });
        } else {
          return Promise.reject('Usuário não encontrado');
        }
      })
      .catch((error) => {
        console.error("Erro no cadastro: ", error); // Exibe o erro completo no console
        throw error; // Relança o erro para ser capturado no componente
      });
  }

  getUserData(uid: string): Promise<UserData | null> {
    return this.firestore
      .collection('usuarios')
      .doc<UserData>(uid)
      .ref.get()
      .then((doc) => {
        if (doc && doc.exists) {
          return doc.data() as UserData; // Certifique-se de que doc não é undefined
        } else {
          return null; // Documento não existe
        }
      })
      .catch((error) => {
        console.error('Erro ao buscar dados do usuário:', error);
        throw error;
      });
  }

  loginUser(email: string, password: string): Promise<void> {
    return this.afAuth
      .signInWithEmailAndPassword(email, password)
      .then(async (userCredential) => {
        const user = userCredential.user;
        if (user) {
          // Agora armazenamos apenas o UID no sessionStorage
          sessionStorage.setItem('userUid', user.uid);
          const userData = await this.getUserData(user.uid); // Obtém os dados do Firestore
          if (userData) {
            this.router.navigate(['/tabs'], { state: { userData } }); // Navega para '/tabs'
          } else {
            throw new Error('Dados do usuário não encontrados no Firestore');
          }
        }
      })
      .catch((error) => {
        console.error('Erro ao fazer login:', error);
        throw error; // Propaga o erro para ser capturado no componente
      });
  }

  logoutUser(): Promise<void> {
    return this.afAuth.signOut().then(() => {
      // Limpa os dados do BehaviorSubject
      this.userSubject.next(null);
      // Remove o UID do sessionStorage quando o usuário se desloga
      sessionStorage.removeItem('userUid');
    }).catch((error) => {
      console.error('Erro ao deslogar:', error);
      throw error;
    });
  }
}
