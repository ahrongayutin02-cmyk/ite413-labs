import { Component, inject } from '@angular/core';
import { AlertController } from '@ionic/angular/lazy';
import { map } from 'rxjs';

import { MenuItemService } from '../services/menu-item.service';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: false,
})
export class Tab3Page {
  private readonly menuItems = inject(MenuItemService);
  private readonly alertController = inject(AlertController);

  readonly backend = this.menuItems.backend;
  readonly backendDetail = this.menuItems.backendDetail;
  readonly itemCount$ = this.menuItems.items$.pipe(map((items) => items.length));

  isBusy = false;
  isToastOpen = false;
  toastMessage = '';

  async resetDemoData(): Promise<void> {
    this.menuItems.resetDemoData();
    this.showToast('Demo rows restored.');
  }

  async confirmClear(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Delete every item?',
      message:
        this.backend === 'firebase'
          ? 'This deletes every document in the menuItems collection. It cannot be undone.'
          : 'This clears the local demo data. It cannot be undone.',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete all',
          role: 'destructive',
          handler: () => {
            void this.clearAll();
          },
        },
      ],
    });

    await alert.present();
  }

  private async clearAll(): Promise<void> {
    this.isBusy = true;
    try {
      await this.menuItems.clearAll();
      this.showToast('All items deleted.');
    } catch (error) {
      console.error('Clearing the menu items failed.', error);
      this.showToast('Could not delete all items.');
    } finally {
      this.isBusy = false;
    }
  }

  private showToast(message: string): void {
    this.toastMessage = message;
    this.isToastOpen = true;
  }
}
