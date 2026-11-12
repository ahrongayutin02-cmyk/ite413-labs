import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { Subscription } from 'rxjs';

import {
  MENU_CATEGORIES,
  MenuCategory,
  MenuItem,
} from '../models/menu-item.model';
import { MenuItemService } from '../services/menu-item.service';

type CategoryFilter = 'All' | MenuCategory;

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: false,
})
export class Tab2Page implements OnInit, OnDestroy {
  private readonly menuItems = inject(MenuItemService);

  readonly categories: CategoryFilter[] = ['All', ...MENU_CATEGORIES];
  readonly backend = this.menuItems.backend;

  allItems: MenuItem[] = [];
  filteredItems: MenuItem[] = [];
  searchTerm = '';
  category: CategoryFilter = 'All';

  isEditOpen = false;
  editing: MenuItem | null = null;
  isBusy = false;
  editSubmitted = false;

  isToastOpen = false;
  toastMessage = '';
  toastColor = 'success';

  private subscription?: Subscription;

  ngOnInit(): void {
    this.subscription = this.menuItems.items$.subscribe((items) => {
      this.allItems = items;
      this.applyFilter();
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  onSearch(event: Event): void {
    this.searchTerm = String((event as CustomEvent).detail?.value ?? '');
    this.applyFilter();
  }

  onSegmentChange(event: Event): void {
    this.category = (event as CustomEvent).detail?.value ?? 'All';
    this.applyFilter();
  }

  applyFilter(): void {
    const term = this.searchTerm.trim().toLowerCase();
    this.filteredItems = this.allItems.filter((item) => {
      const matchesCategory =
        this.category === 'All' || item.category === this.category;
      const matchesTerm =
        !term ||
        item.name.toLowerCase().includes(term) ||
        item.description.toLowerCase().includes(term);
      return matchesCategory && matchesTerm;
    });
  }

  refresh(event: Event): void {
    this.menuItems.refresh();
    window.setTimeout(() => {
      void (event.target as HTMLIonRefresherElement).complete();
    }, 500);
  }

  openEdit(item: MenuItem): void {
    this.editing = { ...item };
    this.editSubmitted = false;
    this.isEditOpen = true;
  }

  closeEdit(): void {
    this.isEditOpen = false;
    this.editing = null;
    this.editSubmitted = false;
  }

  get editNameError(): string {
    if (!this.editSubmitted || !this.editing) {
      return '';
    }
    return this.editing.name.trim().length >= 2
      ? ''
      : 'Enter at least 2 characters.';
  }

  get editPriceError(): string {
    if (!this.editSubmitted || !this.editing) {
      return '';
    }
    const price = Number(this.editing.price);
    return Number.isFinite(price) && price >= 0
      ? ''
      : 'Enter a valid price of 0 or more.';
  }

  async saveEdit(): Promise<void> {
    this.editSubmitted = true;

    if (!this.editing || this.isBusy || !this.canSaveEdit()) {
      return;
    }

    this.isBusy = true;
    try {
      await this.menuItems.updateItem(this.editing.id, {
        name: this.editing.name.trim(),
        category: this.editing.category,
        price: Number(this.editing.price),
        description: this.editing.description.trim(),
        available: this.editing.available,
      });
      this.closeEdit();
      this.showToast('Menu item updated.', 'success');
    } catch (error) {
      console.error('Updating the menu item failed.', error);
      this.showToast('Could not update the item.', 'danger');
    } finally {
      this.isBusy = false;
    }
  }

  async deleteItem(item: MenuItem): Promise<void> {
    if (this.isBusy) {
      return;
    }

    this.isBusy = true;
    try {
      await this.menuItems.deleteItem(item.id);
      this.showToast(`"${item.name}" deleted.`, 'medium');
    } catch (error) {
      console.error('Deleting the menu item failed.', error);
      this.showToast('Could not delete the item.', 'danger');
    } finally {
      this.isBusy = false;
    }
  }

  trackById(_index: number, item: MenuItem): string {
    return item.id;
  }

  categoryColor(category: MenuCategory): string {
    switch (category) {
      case 'Appetizer':
        return 'warning';
      case 'Main':
        return 'primary';
      case 'Dessert':
        return 'tertiary';
      case 'Drink':
        return 'success';
      default:
        return 'medium';
    }
  }

  private canSaveEdit(): boolean {
    if (!this.editing) {
      return false;
    }
    const price = Number(this.editing.price);
    return (
      this.editing.name.trim().length >= 2 &&
      MENU_CATEGORIES.includes(this.editing.category) &&
      Number.isFinite(price) &&
      price >= 0
    );
  }

  private showToast(message: string, color: string): void {
    this.toastMessage = message;
    this.toastColor = color;
    this.isToastOpen = true;
  }
}
