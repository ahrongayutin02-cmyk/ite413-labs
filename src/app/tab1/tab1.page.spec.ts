import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';

import { Tab1PageModule } from './tab1.module';
import { Tab1Page } from './tab1.page';

describe('Tab1Page', () => {
  let component: Tab1Page;
  let fixture: ComponentFixture<Tab1Page>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Tab1PageModule, RouterModule.forRoot([])]
    }).compileComponents();

    fixture = TestBed.createComponent(Tab1Page);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('rejects an empty form', () => {
    expect(component.isValid()).toBe(false);
  });

  it('accepts a complete, valid form', () => {
    component.form = {
      name: 'Chicken Adobo',
      category: 'Main',
      price: 189,
      description: 'Braised chicken.',
      available: true,
    };

    expect(component.isValid()).toBe(true);
  });

  it('rejects a negative price', () => {
    component.form = {
      name: 'Chicken Adobo',
      category: 'Main',
      price: -1,
      description: '',
      available: true,
    };

    expect(component.isValid()).toBe(false);
  });

  it('shows a name error only after a submit attempt', () => {
    expect(component.nameError).toBe('');

    component.submitted = true;
    expect(component.nameError).toContain('2 characters');
  });
});
