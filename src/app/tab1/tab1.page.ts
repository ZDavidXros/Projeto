import { Component, OnInit,Input } from '@angular/core';

@Component({
  selector: 'app-tab1',
  templateUrl: './tab1.page.html',
  styleUrls: ['./tab1.page.scss'],
})
export class Tab1Page implements OnInit {

  @Input() user: any;
  

  constructor() { }

  ngOnInit() {
  }

}
