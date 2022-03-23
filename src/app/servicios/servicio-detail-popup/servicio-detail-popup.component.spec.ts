import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServicioDetailPopupComponent } from './servicio-detail-popup.component';

describe('ServicioDetailPopupComponent', () => {
  let component: ServicioDetailPopupComponent;
  let fixture: ComponentFixture<ServicioDetailPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ServicioDetailPopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ServicioDetailPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
