import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';
import {
  Firestore,
  addDoc,
  collection,
  deleteDoc,
  doc,
  getFirestore,
  onSnapshot,
  updateDoc,
} from 'firebase/firestore';

import { environment } from '../../environments/environment';
import { isFirebaseConfigured } from '../firebase.config';
import {
  MenuItem,
  MenuItemInput,
  MENU_CATEGORIES,
} from '../models/menu-item.model';

export type BackendMode = 'firebase' | 'local';

const COLLECTION_NAME = 'menuItems';
const STORAGE_KEY = 'ite413.menuItems.v1';

/**
 * Single data-access service for the CRUD screens.
 *
 * Backend selection:
 *  - Firebase Firestore when `environment.firebase` holds a real web config.
 *  - localStorage otherwise, so the lab can be demonstrated and tested before
 *    a Firebase project is connected.
 *
 * Both backends expose the same observable + promise API, so the pages never
 * need to know which one is active.
 */
@Injectable({ providedIn: 'root' })
export class MenuItemService {
  private readonly itemsSubject = new BehaviorSubject<MenuItem[]>([]);
  private firestore: Firestore | null = null;
  private stopListener: (() => void) | null = null;

  readonly backend: BackendMode;
  readonly backendDetail: string;

  readonly items$: Observable<MenuItem[]> = this.itemsSubject
    .asObservable()
    .pipe(map((items) => [...items].sort((a, b) => b.createdAt - a.createdAt)));

  constructor() {
    const config = environment.firebase;

    if (isFirebaseConfigured(config)) {
      try {
        const app: FirebaseApp = getApps().length
          ? getApp()
          : initializeApp(config);
        this.firestore = getFirestore(app);
        this.backend = 'firebase';
        this.backendDetail = `Firestore project: ${config.projectId}`;
        this.listenToFirestore();
        return;
      } catch (error) {
        console.error(
          'Firebase could not be initialized. Falling back to local demo storage.',
          error,
        );
      }
    }

    this.backend = 'local';
    this.backendDetail = 'localStorage demo mode (no Firebase config yet)';
    this.loadLocal();
  }

  async addItem(input: MenuItemInput): Promise<void> {
    const clean = this.cleanInput(input);

    if (this.firestore) {
      await addDoc(collection(this.firestore, COLLECTION_NAME), {
        ...clean,
        createdAt: Date.now(),
      });
      return;
    }

    const item: MenuItem = {
      id: this.newId(),
      ...clean,
      createdAt: Date.now(),
    };
    this.emitLocal([item, ...this.itemsSubject.value]);
  }

  async updateItem(id: string, changes: MenuItemInput): Promise<void> {
    const clean = this.cleanInput(changes);

    if (this.firestore) {
      await updateDoc(doc(this.firestore, COLLECTION_NAME, id), { ...clean });
      return;
    }

    this.emitLocal(
      this.itemsSubject.value.map((item) =>
        item.id === id ? { ...item, ...clean } : item,
      ),
    );
  }

  async deleteItem(id: string): Promise<void> {
    if (this.firestore) {
      await deleteDoc(doc(this.firestore, COLLECTION_NAME, id));
      return;
    }

    this.emitLocal(this.itemsSubject.value.filter((item) => item.id !== id));
  }

  /** Re-read local data; Firestore is already live via onSnapshot. */
  refresh(): void {
    if (!this.firestore) {
      this.loadLocal();
    }
  }

  /** Reload the curated demo rows (local mode only). */
  resetDemoData(): void {
    if (this.firestore) {
      return;
    }
    this.emitLocal(this.demoItems());
  }

  /** Remove every row. Used by the About tab with an explicit confirmation. */
  async clearAll(): Promise<void> {
    if (this.firestore) {
      const items = this.itemsSubject.value;
      await Promise.all(
        items.map((item) =>
          deleteDoc(doc(this.firestore as Firestore, COLLECTION_NAME, item.id)),
        ),
      );
      return;
    }

    this.emitLocal([]);
  }

  private listenToFirestore(): void {
    if (!this.firestore) {
      return;
    }

    this.stopListener = onSnapshot(
      collection(this.firestore, COLLECTION_NAME),
      (snapshot) => {
        const items = snapshot.docs.map((entry) => {
          const data = entry.data();
          return {
            id: entry.id,
            name: String(data['name'] ?? ''),
            category: MENU_CATEGORIES.includes(data['category'])
              ? data['category']
              : 'Main',
            price: Number(data['price'] ?? 0),
            description: String(data['description'] ?? ''),
            available: Boolean(data['available']),
            createdAt: Number(data['createdAt'] ?? 0),
          } as MenuItem;
        });
        this.itemsSubject.next(items);
      },
      (error) => {
        console.error(
          'Firestore listener failed. Falling back to local demo storage.',
          error,
        );
        this.stopListener?.();
        this.stopListener = null;
        this.firestore = null;
        this.loadLocal();
      },
    );
  }

  private loadLocal(): void {
    let items: MenuItem[] = [];

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          items = parsed as MenuItem[];
        }
      }
    } catch (error) {
      console.warn('Stored menu items could not be read.', error);
    }

    if (items.length === 0) {
      items = this.demoItems();
      this.persistLocal(items);
    }

    this.itemsSubject.next(items);
  }

  private emitLocal(items: MenuItem[]): void {
    this.persistLocal(items);
    this.itemsSubject.next(items);
  }

  private persistLocal(items: MenuItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.warn('Menu items could not be persisted locally.', error);
    }
  }

  private cleanInput(input: MenuItemInput): MenuItemInput {
    return {
      name: input.name.trim(),
      category: input.category,
      price: Number(input.price),
      description: input.description.trim(),
      available: Boolean(input.available),
    };
  }

  private newId(): string {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID();
    }
    return `local-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  private demoItems(): MenuItem[] {
    const now = Date.now();
    return [
      {
        id: this.newId(),
        name: 'Chicken Adobo',
        category: 'Main',
        price: 189,
        description: 'Slow-braised chicken in soy, vinegar, garlic, and bay leaf.',
        available: true,
        createdAt: now - 1000,
      },
      {
        id: this.newId(),
        name: 'Lumpia Shanghai',
        category: 'Appetizer',
        price: 129,
        description: 'Crisp pork spring rolls with sweet chili dip.',
        available: true,
        createdAt: now - 2000,
      },
      {
        id: this.newId(),
        name: 'Halo-Halo',
        category: 'Dessert',
        price: 149,
        description: 'Shaved ice, milk, beans, jellies, and leche flan.',
        available: false,
        createdAt: now - 3000,
      },
    ];
  }
}
