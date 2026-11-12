import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';

import { Tab2PageModule } from './tab2.module';
import { Tab2Page } from './tab2.page';

describe('Tab2Page', () => {
  let component: Tab2Page;
  let fixture: ComponentFixture<Tab2Page>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Tab2PageModule, RouterModule.forRoot([])]
    }).compileComponents();

    fixture = TestBed.createComponent(Tab2Page);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('filters by search term across name and description', () => {
    component.allItems = [
      item('1', 'Chicken Adobo', 'Main', 'Braised chicken.'),
      item('2', 'Halo-Halo', 'Dessert', 'Shaved ice.'),
      item('3', 'Lumpia', 'Appetizer', 'Crisp spring rolls.'),
    ];

    component.searchTerm = 'braised';
    component.applyFilter();
    expect(component.filteredItems.map((entry) => entry.name)).toEqual([
      'Chicken Adobo',
    ]);

    component.searchTerm = 'lumpia';
    component.applyFilter();
    expect(component.filteredItems.map((entry) => entry.name)).toEqual([
      'Lumpia',
    ]);
  });

  it('filters by category segment', () => {
    component.allItems = [
      item('1', 'Chicken Adobo', 'Main', ''),
      item('2', 'Halo-Halo', 'Dessert', ''),
      item('3', 'Lumpia', 'Appetizer', ''),
    ];

    component.category = 'Dessert';
    component.applyFilter();
    expect(component.filteredItems.map((entry) => entry.name)).toEqual([
      'Halo-Halo',
    ]);

    component.category = 'All';
    component.applyFilter();
    expect(component.filteredItems.length).toBe(3);
  });

  it('combines the search term and category filter', () => {
    component.allItems = [
      item('1', 'Chicken Adobo', 'Main', 'Braised chicken.'),
      item('2', 'Halo-Halo', 'Dessert', 'Shaved ice.'),
    ];

    component.category = 'Main';
    component.searchTerm = 'halo';
    component.applyFilter();

    expect(component.filteredItems.length).toBe(0);
  });
});

function item(
  id: string,
  name: string,
  category: 'Appetizer' | 'Main' | 'Dessert' | 'Drink',
  description: string,
) {
  return {
    id,
    name,
    category,
    description,
    price: 100,
    available: true,
    createdAt: 1,
  };
}
