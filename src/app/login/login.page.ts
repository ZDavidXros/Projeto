import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';  // Importando o AuthService

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  email: string = '';   // Para armazenar o email
  senha: string = '';   // Para armazenar a senha

  constructor(
    private router: Router,
    private authService: AuthService  // Injeta o AuthService
  ) {}

  // Método para realizar o login
  async login() {
    try {
      // Verifica se o email e a senha estão preenchidos
      if (!this.email || !this.senha) {
        alert('Por favor, insira o email e a senha.');
        return;
      }

      // Chama o método de login no AuthServiceaaaaa
      await this.authService.loginUser(this.email, this.senha);

      // Se o login for bem-sucedido, a navegação para '/tabs' ocorrerá
    } catch (error: unknown) {
      // Verificando se o erro é uma instância de Error
      if (error instanceof Error) {
        alert('Erro ao realizar o login: ' + error.message);
      } else {
        alert('Erro desconhecido ao realizar o login');
      }
    }
  }
}
