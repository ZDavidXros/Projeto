import { Component, OnInit } from '@angular/core';
import { AuthService, UserData } from '../services/auth.service';
import firebase from 'firebase/compat/app';  // Certifique-se de usar a importação correta
import { Router } from '@angular/router';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-tab1',
  templateUrl: './tab1.page.html',
  styleUrls: ['./tab1.page.scss'],
})
export class Tab1Page implements OnInit {
  userData: UserData | null = null;
  otherUsers: UserData[] = [];  // Lista de outros usuários
  currentUserUid: string = '';
  currentProfileIndex: number = 0;  // Índice do perfil atual sendo visualizado
  currentPhotoIndex: number = 0;  

  constructor(private authService: AuthService, private router: Router, private firestore: AngularFirestore) {}

  ngOnInit() {
    this.currentUserUid = sessionStorage.getItem('userUid')!;
    this.loadOtherUsers();
  }

  async loadOtherUsers() {
    try {
      const snapshot = await this.authService.getFirestore().collection('usuarios').get().toPromise();
  
      if (!snapshot || snapshot.empty) {
        console.error('Nenhum usuário encontrado ou snapshot vazio.');
        return;
      }
  
      const users: UserData[] = snapshot.docs.map(doc => doc.data() as UserData);
  
      // Filtra para garantir que o usuário logado NÃO seja mostrado
      this.otherUsers = users.filter(user => 
        user.uid !== this.currentUserUid && 
        !user.likesRecebidos?.includes(this.currentUserUid) && 
        !user.dislikesRecebidos?.includes(this.currentUserUid) // Exclui os perfis que o usuário já deu like ou dislike
      );
  
      if (this.otherUsers.length === 0) {
        console.log('Nenhum outro usuário para exibir.');
        return;
      }
  
      this.loadUserData();
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    }
  }

  loadUserData() {
    // Carregar dados do perfil atual
    if (this.otherUsers.length > 0 && this.currentProfileIndex < this.otherUsers.length) {
      this.userData = this.otherUsers[this.currentProfileIndex];
    }
  }

  getTags(tags: string): string[] {
    return tags.split(',').map(tag => tag.trim()); // Retira espaços extras e divide as tags
  }

  nextPhoto() {
    if (this.userData && this.userData.fotos.length > 0) {
      // Alterna entre as imagens
      this.currentPhotoIndex = (this.currentPhotoIndex + 1) % this.userData.fotos.length;
    }
  }
 
  async likeUser() {
    if (this.userData) {
      try {
        const userUid = this.userData.uid;
  
        if (userUid === this.currentUserUid) {
          console.error('Erro: Não é permitido dar like no próprio perfil.');
          return;
        }
  
        // Pega o documento do usuário logado
        const currentUserDoc = await this.authService.getFirestore().collection('usuarios').doc(this.currentUserUid).get().toPromise();
  
        if (!currentUserDoc || !currentUserDoc.exists) {
          console.error('Documento do usuário logado não encontrado.');
          return;
        }
  
        const currentUserData = currentUserDoc.data() as UserData;
  
        const targetUserDoc = await this.authService.getFirestore().collection('usuarios').doc(userUid).get().toPromise();
  
        if (!targetUserDoc || !targetUserDoc.exists) {
          console.error('Documento do usuário alvo não encontrado.');
          return;
        }
  
        const targetUserData = targetUserDoc.data() as UserData;
  
        const targetLikesRecebidos = targetUserData.likesRecebidos || [];
        if (!targetLikesRecebidos.includes(this.currentUserUid)) {
          const updatedLikes = [...targetLikesRecebidos, this.currentUserUid];
          await this.authService.getFirestore().collection('usuarios').doc(userUid).update({
            likesRecebidos: updatedLikes
          });
  
          const updatedTargetUserDoc = await this.authService.getFirestore().collection('usuarios').doc(userUid).get().toPromise();
  
          if (updatedTargetUserDoc && updatedTargetUserDoc.exists) {
            const updatedTargetUserData = updatedTargetUserDoc.data() as UserData;
  
            console.log('Likes Recebidos do Alvo após Atualização: ', updatedTargetUserData.likesRecebidos);
  
            // Verificação de match
            if (
              updatedTargetUserData.likesRecebidos &&
              updatedTargetUserData.likesRecebidos.includes(this.currentUserUid)
            ) {
              console.log('Match Confirmado! Criando match...');
              console.log(`Debug: Passando valores para createMatch - currentUserUid: ${this.currentUserUid}, targetUserUid: ${userUid}`);
              this.createMatch(this.currentUserUid, updatedTargetUserData);
            } else {
              console.log('Não houve match.');
            }
            
          }
        }
      } catch (error) {
        console.error('Erro ao curtir usuário:', error);
      }
    }
  
    this.nextProfile();
  }
  
  
  
  
  
  async dislikeUser() {
    if (this.userData) {
      try {
        const userUid = this.userData.uid;
  
        // Pega o documento do usuário logado
        const currentUserDoc = await this.authService.getFirestore().collection('usuarios').doc(this.currentUserUid).get().toPromise();
  
        // Verifica se o documento do usuário logado existe
        if (!currentUserDoc || !currentUserDoc.exists) {
          console.error('Documento do usuário logado não encontrado.');
          return;
        }
  
        const currentUserData = currentUserDoc.data() as UserData;
  
        if (currentUserData) {
          // Pega o documento do usuário alvo (aquele que você está dando dislike)
          const targetUserDoc = await this.authService.getFirestore().collection('usuarios').doc(userUid).get().toPromise();
  
          // Verifica se o documento do usuário alvo existe
          if (!targetUserDoc || !targetUserDoc.exists) {
            console.error('Documento do usuário alvo não encontrado.');
            return;
          }
  
          const targetUserData = targetUserDoc.data() as UserData;
  
          // Atualiza o campo dislikesRecebidos do usuário alvo (outro usuário)
          const targetDislikesRecebidos = targetUserData.dislikesRecebidos || []; // Usando valor default (array vazio)
          if (!targetDislikesRecebidos.includes(this.currentUserUid)) {
            const updatedDislikes = [...targetDislikesRecebidos, this.currentUserUid]; // Adiciona o ID do usuário logado aos dislikesRecebidos do outro usuário
            await this.authService.getFirestore().collection('usuarios').doc(userUid).update({
              dislikesRecebidos: updatedDislikes
            });
          }
        }
      } catch (error) {
        console.error('Erro ao dar dislike:', error);
      }
    }
  }
 
  async createMatch(currentUserUid: string, targetUserData: UserData) {
    try {
      console.log(`Iniciando createMatch com currentUserUid: ${currentUserUid}, targetUserUid: ${targetUserData.uid}`);
  
      if (currentUserUid === targetUserData.uid) {
        console.error('Erro: Não é possível criar um match com o próprio usuário.');
        return;
      }
  
      const currentUserUidStr = String(currentUserUid);
      const targetUserUidStr = String(targetUserData.uid);
  
      console.log(`Validando match entre: ${currentUserUidStr} e ${targetUserUidStr}`);
  
      const currentUserDoc = await this.authService.getFirestore().collection('usuarios').doc(currentUserUidStr).get().toPromise();
      const targetUserDoc = await this.authService.getFirestore().collection('usuarios').doc(targetUserUidStr).get().toPromise();
  
      if (currentUserDoc?.exists && targetUserDoc?.exists) {
        const currentUserData = currentUserDoc.data() as UserData | undefined;
        const targetUserDataFromDb = targetUserDoc.data() as UserData | undefined;
  
        if (!currentUserData || !targetUserDataFromDb) {
          console.error('Erro ao acessar os dados de um ou ambos os usuários.');
          return;
        }
  
        const currentUserMatches = currentUserData.matches || [];
        const targetUserMatches = targetUserDataFromDb.matches || [];
  
        const updatedCurrentUserMatches = [...currentUserMatches, targetUserUidStr];
        const updatedTargetUserMatches = [...targetUserMatches, currentUserUidStr];
  
        await this.authService.getFirestore().collection('usuarios').doc(currentUserUidStr).update({
          matches: updatedCurrentUserMatches
        });
  
        await this.authService.getFirestore().collection('usuarios').doc(targetUserUidStr).update({
          matches: updatedTargetUserMatches
        });
  
        console.log(`Match entre ${currentUserUidStr} e ${targetUserUidStr} criado com sucesso!`);
  
        // Adicionando a criação do chat após o match
        console.log(`Criando chat entre ${currentUserUidStr} e ${targetUserUidStr}`);
        await this.authService.createChat(currentUserUidStr, targetUserUidStr); // Chama pelo serviço
        console.log('Chat criado com sucesso após o match!');
      } else {
        console.error('Um ou ambos os documentos de usuário não existem.');
      }
    } catch (error) {
      console.error('Erro ao criar match:', error);
    }
  }
  
  nextProfile() {
    // Verifica se há mais de 1 perfil para exibir (diferente do usuário logado)
    if (this.currentProfileIndex < this.otherUsers.length - 1) {
      // Avança para o próximo perfil
      this.currentProfileIndex++;  

      // Pula os perfis que o usuário logado já deu like ou dislike
      while (this.currentProfileIndex < this.otherUsers.length &&
             (this.otherUsers[this.currentProfileIndex]?.uid === this.currentUserUid || 
              this.otherUsers[this.currentProfileIndex]?.likesRecebidos?.includes(this.currentUserUid) || 
              this.otherUsers[this.currentProfileIndex]?.dislikesRecebidos?.includes(this.currentUserUid))) {
        this.currentProfileIndex++;  // Avança para o próximo perfil
      }
      
      // Verifica se o perfil atual é válido
      if (this.currentProfileIndex < this.otherUsers.length) {
        this.loadUserData(); // Carrega os dados do próximo perfil
      } else {
        // Não há mais perfis disponíveis para exibir
        console.log('Você visualizou todos os perfis disponíveis');
        alert('Não há mais perfis para visualizar');
      }
    } else {
      // Caso o último perfil seja o do usuário logado ou se não houver mais perfis
      if (this.otherUsers[this.currentProfileIndex]?.uid === this.currentUserUid || 
          this.currentProfileIndex >= this.otherUsers.length) {
        console.log('Você visualizou todos os perfis disponíveis');
        alert('Não há mais perfis para visualizar');
      }
    }
  }
}
