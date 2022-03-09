import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServicioPopupComponent } from './servicio-popup.component';

describe('ServicioPopupComponent', () => {
  let component: ServicioPopupComponent;
  let fixture: ComponentFixture<ServicioPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ServicioPopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ServicioPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
