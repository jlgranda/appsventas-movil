import { TestBed, async } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';
import { AppMainComponent } from './app.main.component';
import { AppMenuComponent } from './app.menu.component';
import { AppTopBarComponent } from './app.topbar.component';
import { AppConfigComponent } from './app.config.component';
import { AppFooterComponent } from './app.footer.component';
import { AppBreadcrumbComponent } from './app.breadcrumb.component';
import { BreadcrumbService } from './app.breadcrumb.service';
import { TabViewModule } from 'primeng/tabview';

describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
          NoopAnimationsModule, RouterTestingModule, TabViewModule
      ],
      declarations: [
          AppComponent,
          AppMainComponent,
          AppMenuComponent,
          AppTopBarComponent,
          AppConfigComponent,
          AppFooterComponent,
          AppBreadcrumbComponent
      ],
      providers: [BreadcrumbService]
    }).compileComponents();
  }));

  it('should create the app', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));
});
