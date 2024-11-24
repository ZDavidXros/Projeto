import { Component } from '@angular/core';
import { Router } from '@angular/router';  // Importa o Router para navegação

@Component({
  selector: 'app-fotos',
  templateUrl: './fotos.page.html',
  styleUrls: ['./fotos.page.scss'],
})
export class FotosPage {
  constructor(private router: Router) {} // Injeta o Router no construtor

  // Método para voltar à página de login
  goToLogin() {
    this.router.navigate(['/login']);
  }
}
