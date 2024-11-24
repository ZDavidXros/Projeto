import { Component, OnInit } from '@angular/core';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  constructor(private authService: AuthService, private router: Router, private platform: Platform) {
    this.platform.ready().then(() => {
      document.body.classList.add('dark'); // Força o tema escuro
    });
  }

  ngOnInit() {
    this.authService.user$.subscribe((user) => {
      if (user) {
        // Redireciona apenas se o usuário estiver logado e acessando a página de login
        this.router.navigate(['/tabs']);
      }
    });
  }
}
