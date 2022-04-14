import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServicioQuantityPopupComponent } from './servicio-quantity-popup.component';

describe('ServicioQuantityPopupComponent', () => {
  let component: ServicioQuantityPopupComponent;
  let fixture: ComponentFixture<ServicioQuantityPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ServicioQuantityPopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ServicioQuantityPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
