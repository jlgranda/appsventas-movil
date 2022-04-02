import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InformacionBancariaComponent } from './informacion-bancaria.component';

describe('InformacionBancariaComponent', () => {
  let component: InformacionBancariaComponent;
  let fixture: ComponentFixture<InformacionBancariaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InformacionBancariaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InformacionBancariaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
