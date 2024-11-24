import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TabsPage } from './tabs.page';
import { TabsPageRoutingModule } from './tabs-routing.module'; 
 // O módulo de rotas das tabs

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TabsPageRoutingModule  // Importa o módulo de rotas das tabs
  ],
  declarations: [TabsPage]
})
export class TabsPageModule {}
