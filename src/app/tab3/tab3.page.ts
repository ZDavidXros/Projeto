import { Component, OnInit,Input } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AuthService } from '../services/auth.service';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-tab3',
  templateUrl: './tab3.page.html',
  styleUrls: ['./tab3.page.scss'],
})
export class Tab3Page implements OnInit {
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
  router: any;

  constructor(
    private firestore: AngularFirestore,
    private authService: AuthService,
    private platform: Platform
  ) {}

  ngOnInit() {
    this.authService.user$.subscribe((user) => {
      if (user) {
        this.loadUserData(); // Sem passar parâmetros
      } else {
        console.error('Nenhum usuário logado');
        // Opcional: Redirecione para a página de login, se necessário
        this.router.navigate(['/login']);
      }
    });
  }
  
  async loadUserData() {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      console.error('Nenhum usuário logado');
      return;
    }
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

  async editProfilePhoto() {
    await this.addProfilePhoto();
  }

  async addProfilePhoto() {
    if (this.platform.is('hybrid')) {
      const photo = await Camera.getPhoto({
        quality: 90,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Prompt,
      });
      if (photo?.dataUrl) {
        this.user.fotoPerfil = photo.dataUrl;
      }
    } else {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (event: any) => {
        const file = event.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = () => {
            this.user.fotoPerfil = reader.result as string;
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
    }
  }

  async addPhoto(index: number) {
    if (this.platform.is('hybrid')) {
      const photo = await Camera.getPhoto({
        quality: 90,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Prompt,
      });
      if (photo?.dataUrl) {
        this.user.fotos[index] = photo.dataUrl;
      }
    } else {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (event: any) => {
        const file = event.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = () => {
            this.user.fotos[index] = reader.result as string;
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
    }
  }
  logout() {
    this.authService.logoutUser().then(() => {
      this.router.navigate(['/login']); // Redireciona para a página de login após o logout
    }).catch((error) => {
      console.error('Erro ao fazer logout:', error);
    });
  }

  removeAllPhotos() {
    this.user.fotos = ['', '', '', ''];
  }

  async saveProfile() {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      const updatedData: any = {};

      if (this.user.fotoPerfil) {
        updatedData.fotoPerfil = this.user.fotoPerfil;
      }
      if (this.user.fotos.length > 0) {
        updatedData.fotos = this.user.fotos.filter((photo: string | null) => photo !== null);
      }
      if (this.user.nome) {
        updatedData.nome = this.user.nome;
      }
      if (this.user.universidade) {
        updatedData.universidade = this.user.universidade;
      }
      if (this.user.celular) {
        updatedData.celular = this.user.celular;
      }
      if (this.user.curte) {
        updatedData.curte = this.user.curte;
      }
      if (this.user.dataNascimento) {
        updatedData.dataNascimento = this.user.dataNascimento;
      }
      if (this.user.discord) {
        updatedData.discord = this.user.discord;
      }
      if (this.user.genero) {
        updatedData.genero = this.user.genero;
      }
      if (this.user.joga) {
        updatedData.joga = this.user.joga;
      }
      if (this.user.periodo) {
        updatedData.periodo = this.user.periodo;
      }
      if (this.user.procura) {
        updatedData.procura = this.user.procura;
      }

      try {
        await this.firestore.collection('usuarios').doc(currentUser.uid).update(updatedData);
        console.log('Perfil salvo com sucesso!');
      } catch (error) {
        console.error('Erro ao salvar o perfil:', error);
      }
    }
  }
}
