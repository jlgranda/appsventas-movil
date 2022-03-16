import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FacturasInvalidasPopupComponent } from './facturas-invalidas-popup.component';

describe('FacturasInvalidasPopupComponent', () => {
  let component: FacturasInvalidasPopupComponent;
  let fixture: ComponentFixture<FacturasInvalidasPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FacturasInvalidasPopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FacturasInvalidasPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
