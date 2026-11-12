import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

import {
  EMPTY_MENU_ITEM,
  MENU_CATEGORIES,
  MenuCategory,
  MenuItemInput,
} from '../models/menu-item.model';
import {
  BackendMode,
  MenuItemService,
} from '../services/menu-item.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: false,
})
export class Tab1Page {
  private readonly menuItems = inject(MenuItemService);
  private readonly router = inject(Router);

  readonly categories = MENU_CATEGORIES;

  get backend(): BackendMode {
    return this.menuItems.backend;
  }

  form: MenuItemInput = { ...EMPTY_MENU_ITEM };
  submitted = false;
  isSaving = false;

  isToastOpen = false;
  toastMessage = '';
  toastColor = 'success';

  get nameError(): string {
    if (!this.submitted) {
      return '';
    }
    return this.form.name.trim().length >= 2
      ? ''
      : 'Enter at least 2 characters.';
  }

  get priceError(): string {
    if (!this.submitted) {
      return '';
    }
    const price = Number(this.form.price);
    return Number.isFinite(price) && price >= 0
      ? ''
      : 'Enter a valid price of 0 or more.';
  }

  isValid(): boolean {
    const price = Number(this.form.price);
    return (
      this.form.name.trim().length >= 2 &&
      this.categories.includes(this.form.category) &&
      Number.isFinite(price) &&
      price >= 0
    );
  }

  async save(): Promise<void> {
    this.submitted = true;

    if (!this.isValid() || this.isSaving) {
      return;
    }

    this.isSaving = true;
    try {
      await this.menuItems.addItem({
        ...this.form,
        name: this.form.name.trim(),
        price: Number(this.form.price),
      });
      this.form = { ...EMPTY_MENU_ITEM };
      this.submitted = false;
      this.showToast('Menu item added successfully.', 'success');
    } catch (error) {
      console.error('Adding the menu item failed.', error);
      this.showToast(
        'Could not save the item. Check the Firebase config and rules.',
        'danger',
      );
    } finally {
      this.isSaving = false;
    }
  }

  viewItems(): void {
    void this.router.navigateByUrl('/tabs/tab2');
  }

  selectCategory(category: MenuCategory): void {
    this.form.category = category;
  }

  private showToast(message: string, color: string): void {
    this.toastMessage = message;
    this.toastColor = color;
    this.isToastOpen = true;
  }
}
