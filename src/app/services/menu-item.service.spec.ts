import { firstValueFrom } from 'rxjs';

import { environment } from '../../environments/environment';
import { MenuItemInput } from '../models/menu-item.model';
import { MenuItemService } from './menu-item.service';

const SAMPLE: MenuItemInput = {
  name: 'Test Pancit',
  category: 'Main',
  price: 175,
  description: 'Noodles for the test suite.',
  available: true,
};

describe('MenuItemService (local demo mode)', () => {
  const realConfig = environment.firebase;

  beforeEach(() => {
    // These tests exercise the localStorage backend, so keep them
    // deterministic even when the app points at a real Firestore project.
    environment.firebase = {
      apiKey: 'YOUR_API_KEY',
      authDomain: 'YOUR_PROJECT_ID.firebaseapp.com',
      projectId: 'YOUR_PROJECT_ID',
      storageBucket: 'YOUR_PROJECT_ID.appspot.com',
      messagingSenderId: 'YOUR_SENDER_ID',
      appId: 'YOUR_APP_ID',
      measurementId: 'G-YOUR_MEASUREMENT_ID',
    };
    localStorage.clear();
  });

  afterAll(() => {
    environment.firebase = realConfig;
  });

  it('starts in local mode and seeds demo rows', async () => {
    const service = new MenuItemService();
    const items = await firstValueFrom(service.items$);

    expect(service.backend).toBe('local');
    expect(items.length).toBe(3);
    expect(items.map((item) => item.name)).toContain('Chicken Adobo');
  });

  it('creates, updates, deletes, and persists an item', async () => {
    const service = new MenuItemService();
    await service.addItem(SAMPLE);

    let items = await firstValueFrom(service.items$);
    const created = items.find((item) => item.name === SAMPLE.name);

    expect(created).toBeDefined();
    expect(items.length).toBe(4);

    await service.updateItem(created!.id, {
      ...SAMPLE,
      name: 'Updated Pancit',
      price: 199,
      available: false,
    });

    items = await firstValueFrom(service.items$);
    const updated = items.find((item) => item.id === created!.id);

    expect(updated?.name).toBe('Updated Pancit');
    expect(updated?.price).toBe(199);
    expect(updated?.available).toBe(false);

    // A fresh instance must read the persisted copy.
    const reloaded = new MenuItemService();
    const persisted = await firstValueFrom(reloaded.items$);
    expect(persisted.find((item) => item.id === created!.id)?.name).toBe(
      'Updated Pancit',
    );

    await service.deleteItem(created!.id);
    items = await firstValueFrom(service.items$);
    expect(items.find((item) => item.id === created!.id)).toBeUndefined();
  });

  it('clears all rows and restores the demo rows', async () => {
    const service = new MenuItemService();

    await service.clearAll();
    expect((await firstValueFrom(service.items$)).length).toBe(0);

    service.resetDemoData();
    expect((await firstValueFrom(service.items$)).length).toBe(3);
  });

  it('keeps an intentionally empty list empty after a reload', async () => {
    const service = new MenuItemService();

    await service.clearAll();

    const reloaded = new MenuItemService();
    expect((await firstValueFrom(reloaded.items$)).length).toBe(0);
  });

  it('trims text and coerces the price before saving', async () => {
    const service = new MenuItemService();

    await service.addItem({
      ...SAMPLE,
      name: '  Trimmed Name  ',
      description: '  Trimmed description  ',
      price: '250' as unknown as number,
    });

    const items = await firstValueFrom(service.items$);
    const created = items.find((item) => item.name === 'Trimmed Name');

    expect(created?.description).toBe('Trimmed description');
    expect(created?.price).toBe(250);
  });
});
