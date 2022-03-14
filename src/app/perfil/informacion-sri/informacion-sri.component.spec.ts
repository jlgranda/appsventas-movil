import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InformacionSriComponent } from './informacion-sri.component';

describe('InformacionSriComponent', () => {
  let component: InformacionSriComponent;
  let fixture: ComponentFixture<InformacionSriComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InformacionSriComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InformacionSriComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
