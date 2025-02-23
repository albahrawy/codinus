import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppMigrateComponent } from './lib/app-migrate/app-migrate.component';

describe('AppMigrateComponent', () => {
  let component: AppMigrateComponent;
  let fixture: ComponentFixture<AppMigrateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppMigrateComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AppMigrateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
