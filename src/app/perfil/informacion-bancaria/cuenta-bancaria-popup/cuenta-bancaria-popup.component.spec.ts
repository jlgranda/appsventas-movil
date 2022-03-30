import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CuentaBancariaPopupComponent } from './cuenta-bancaria-popup.component';

describe('CuentaBancariaPopupComponent', () => {
  let component: CuentaBancariaPopupComponent;
  let fixture: ComponentFixture<CuentaBancariaPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CuentaBancariaPopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CuentaBancariaPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
