import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FacturaServicioComponent } from './factura-servicio.component';

describe('FacturaServicioComponent', () => {
  let component: FacturaServicioComponent;
  let fixture: ComponentFixture<FacturaServicioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FacturaServicioComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FacturaServicioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
