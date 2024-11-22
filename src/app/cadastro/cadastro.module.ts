import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CadastroPageRoutingModule } from './cadastro-routing.module';
import { CadastroPage } from './cadastro.page';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';  


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    AngularFirestoreModule,
    IonicModule,
    CadastroPageRoutingModule,
    AngularFireAuthModule,  
  ],
  declarations: [CadastroPage],
 
})
export class CadastroPageModule {}
