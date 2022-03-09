import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactosPopupComponent } from './contactos-popup.component';

describe('ContactosPopupComponent', () => {
  let component: ContactosPopupComponent;
  let fixture: ComponentFixture<ContactosPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ContactosPopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ContactosPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
