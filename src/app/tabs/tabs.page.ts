
import { Component, OnInit,Input } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AuthService } from '../services/auth.service';
import { Platform } from '@ionic/angular';
import { Router } from '@angular/router';


@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
})
export class TabsPage implements OnInit {
  user: any = {
    nome: '',
    universidade: '',
    celular: '',
    curte: '',
    dataNascimento: '',
    discord: '',
    genero: '',
    joga: '',
    periodo: '',
    procura: '',
    fotos: ['', '', '',''], 
    fotoPerfil: ''
  };
  

  constructor(private firestore: AngularFirestore,
    private authService: AuthService,
    private platform: Platform,private router: Router) { }


 

    ngOnInit() {
      this.authService.user$.subscribe((user) => {
        if (user) {
          this.loadUserData();
        } else if (user === null) { // Apenas redireciona se explicitamente deslogado
          this.router.navigate(['/login']);
        }
      });
    }
    
  
  async loadUserData() {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      try {
        const docRef = this.firestore.collection('usuarios').doc(currentUser.uid);
        const doc = await docRef.ref.get();
        if (doc.exists) {
          this.user = doc.data();
          console.log("Dados do usuário carregados com sucesso:", this.user);
        } else {
          console.error('Usuário não encontrado no Firestore');
        }
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
      }
    } else {
      console.error('Nenhum usuário logado');
    }
  }

  logout() {
    this.authService.logoutUser().then(() => {
      this.router.navigate(['/login']); // Redireciona para a página de login após o logout
    }).catch((error) => {
      console.error('Erro ao fazer logout:', error);
    });
  }
}

