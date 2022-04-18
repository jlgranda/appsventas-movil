import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FacturaSriPopupComponent } from './factura-sri-popup.component';

describe('FacturaSriPopupComponent', () => {
  let component: FacturaSriPopupComponent;
  let fixture: ComponentFixture<FacturaSriPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FacturaSriPopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FacturaSriPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
