import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CertificadoPopupComponent } from './certificado-popup.component';

describe('CertificadoPopupComponent', () => {
  let component: CertificadoPopupComponent;
  let fixture: ComponentFixture<CertificadoPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CertificadoPopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CertificadoPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
