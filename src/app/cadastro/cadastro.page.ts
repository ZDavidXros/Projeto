import { Component } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Platform } from '@ionic/angular';
import { AuthService } from '../services/auth.service';  // Importe o AuthService
import { Router } from '@angular/router';

interface UserData {
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
}

@Component({
  selector: 'app-cadastro',
  templateUrl: './cadastro.page.html',
  styleUrls: ['./cadastro.page.scss'],
})
export class CadastroPage {
  currentStep: number = 1;
  photos: string[] = Array(4).fill(null);
  nome: string = '';
  dataNascimento: string = '';
  email: string = '';
  senha: string = '';
  confirmacaoSenha: string = '';
  universidade: string = '';
  genero: string = '';
  celular: string = '';
  periodo: string = '';
  discord: string = '';
  curte: string = '';
  procura: string = '';
  joga: string = '';

  constructor(
    private router: Router,
    private platform: Platform,
    private authService: AuthService,  // Use o AuthService aqui
  ) {}

  // Método para ir para a próxima etapa
  nextStep() {
    if (this.validarDados()) {
      this.currentStep++;
    }
  }

  // Captura ou seleciona uma foto
  async addPhoto(index: number) {
    if (this.platform.is('hybrid')) {
      try {
        const photo = await Camera.getPhoto({
          quality: 90,
          resultType: CameraResultType.DataUrl,
          source: CameraSource.Prompt,
        });
        if (photo?.dataUrl) {
          this.photos[index] = photo.dataUrl;
        }
      } catch (error) {
        console.error('Erro ao capturar a foto:', error);
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
            this.photos[index] = reader.result as string;
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
    }
  }

  validarDados(): boolean {
    if (this.currentStep === 1) {
      // Validação do nome
      if (!this.nome.trim()) {
        alert('O nome é obrigatório.');
        return false;
      }
      if (this.nome.trim().length < 4) {
        alert('O nome deve ter pelo menos 4 letras.');
        return false;
      }
    } else if (this.currentStep === 2) {
      const hoje = new Date();
      const nascimento = new Date(this.dataNascimento); // Converte para Date
  
      // Usando let ao invés de const para que a variável possa ser reatribuída
      let idade = hoje.getFullYear() - nascimento.getFullYear();
      const m = hoje.getMonth() - nascimento.getMonth();
      
      // Ajuste para subtrair 1 ano caso o aniversário ainda não tenha ocorrido no ano
      if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) {
        idade--;
      }
  
      if (isNaN(nascimento.getTime())) {
        alert('Digite uma data de nascimento válida.');
        return false;
      }
      if (idade < 18) {
        alert('Você deve ter pelo menos 18 anos para se cadastrar.');
        return false;
      }

      if (isNaN(nascimento.getTime())) {
        alert('Digite uma data de nascimento válida.');
        return false;
      }
      if (idade < 18) {
        alert('Você deve ter pelo menos 18 anos para se cadastrar.');
        return false;
      }

      // Validação do e-mail
      if (!this.email.trim()) {
        alert('O e-mail é obrigatório.');
        return false;
      }
      if (!/^\S+@\S+\.\S+$/.test(this.email)) {
        alert('Digite um e-mail válido.');
        return false;
      }

      // Validação da senha
      if (!this.senha.trim()) {
        alert('A senha é obrigatória.');
        return false;
      }
      if (this.senha.length < 6) {
        alert('A senha deve ter pelo menos 6 caracteres.');
        return false;
      }

      // Validação da confirmação de senha
      if (!this.confirmacaoSenha.trim()) {
        alert('A confirmação de senha é obrigatória.');
        return false;
      }
      if (this.senha !== this.confirmacaoSenha) {
        alert('As senhas não coincidem.');
        return false;
      }

      // Validação de dados adicionais no Step 2
      if (!this.celular.trim() || !/^\d{10,11}$/.test(this.celular)) {
        alert('Digite um celular válido com DDD.');
        return false;
      }
      if (!this.genero || !['masculino', 'feminino', 'outro'].includes(this.genero)) {
        alert('Selecione um gênero válido.');
        return false;
      }
      if (!this.universidade.trim()) {
        alert('O campo universidade é obrigatório.');
        return false;
      }
      if (!this.periodo.trim()) {
        alert('O campo período é obrigatório.');
        return false;
      }

      if (!this.curte || !['fps', 'mmorpg', 'rpg', 'simulacao', 'outros'].includes(this.curte)) {
        alert('Selecione o que você curte.');
        return false;
      }
      if (!this.procura || !['duo', 'trio', 'squad', 'ptfull', 'relacionamento'].includes(this.procura)) {
        alert('Selecione o que você procura.');
        return false;
      }
      if (!this.joga || !['pc', 'xbox', 'playstation', 'nintendo', 'mobile', 'outros'].includes(this.joga)) {
        alert('Selecione onde você joga.');
        return false;
      }
    } else if (this.currentStep === 3) {
      // Validação das fotos
      if (this.photos.filter((photo) => photo).length < 2) {
        alert('Adicione pelo menos 2 fotos.');
        return false;
      }
      const dataFormatada = new Date(this.dataNascimento).toLocaleDateString('pt-BR'); // Exemplo de formato "dd/mm/aaaa"
  this.dataNascimento = dataFormatada; // Atualiza a data para o formato desejado
    }

    // Se tudo estiver válido, retorna true
    return true;
  }

  

  async completeRegistration() {
    // Valida os dados antes de enviar
    if (!this.validarDados()) return;

    try {
      // Criando um objeto userData que agora tem a tipagem UserData
      const userData: UserData = {
        uid: '', 
        nome: this.nome,
        dataNascimento: this.dataNascimento,  // Sem formatar
        email: this.email,
        universidade: this.universidade,
        genero: this.genero,
        celular: this.celular,
        periodo: this.periodo,
        discord: this.discord,
        curte: this.curte,
        procura: this.procura,
        joga: this.joga,
        fotos: this.photos.filter((p) => p), // Remove fotos vazias
      };

      // Usando o AuthService para criar o usuário no Firebase
      await this.authService.registerUser(this.email, this.senha, userData);

      // Exibe uma mensagem de sucesso
      alert('Cadastro realizado com sucesso!');

      // Redireciona para a página de login
      this.router.navigate(['/login']);
    } catch (error: unknown) {
      // Captura o erro e loga no console para facilitar a depuração
      if (error instanceof Error) {
        console.error('Erro ao realizar o cadastro:', error.message);
        alert('Erro ao realizar o cadastro: ' + error.message);
      } else {
        console.error('Erro desconhecido:', error);
        alert('Erro desconhecido ao realizar o cadastro');
      }
    }
  }
}
