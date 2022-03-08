import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PerfilPhotoPopupComponent } from './perfil-photo-popup.component';

describe('PerfilPhotoPopupComponent', () => {
  let component: PerfilPhotoPopupComponent;
  let fixture: ComponentFixture<PerfilPhotoPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PerfilPhotoPopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PerfilPhotoPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
