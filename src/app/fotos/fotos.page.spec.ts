import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FotosPage } from './fotos.page';

describe('FotosPage', () => {
  let component: FotosPage;
  let fixture: ComponentFixture<FotosPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(FotosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
