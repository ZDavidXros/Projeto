import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';  // Importa o Router para navegação

@Component({
  selector: 'app-fotos',
  templateUrl: './fotos.page.html',
  styleUrls: ['./fotos.page.scss'],
})
export class FotosPage implements OnInit {

  constructor(private router: Router) { }  // Injeta o Router no construtor

  ngOnInit() {
  }

  // Método para voltar à página de login
  goToLogin() {
    this.router.navigate(['/login']);
  }

}
