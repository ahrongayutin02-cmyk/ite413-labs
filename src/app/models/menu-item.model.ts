export type MenuCategory = 'Appetizer' | 'Main' | 'Dessert' | 'Drink';

export const MENU_CATEGORIES: MenuCategory[] = [
  'Appetizer',
  'Main',
  'Dessert',
  'Drink',
];

/**
 * Data model for the Lab 4 enhancement task.
 *
 * Entity: a menu item belonging to a restaurant.
 * Each field has a deliberate type and purpose:
 *  - id          unique Firestore document id (or local uuid)
 *  - name        display name shown in the list
 *  - category    fixed taxonomy used by the filter segment
 *  - price       non-negative amount in PHP
 *  - description free text shown under the name
 *  - available   whether the kitchen can serve it today
 *  - createdAt   epoch milliseconds, used for newest-first ordering
 */
export interface MenuItem {
  id: string;
  name: string;
  category: MenuCategory;
  price: number;
  description: string;
  available: boolean;
  createdAt: number;
}

export type MenuItemInput = Omit<MenuItem, 'id' | 'createdAt'>;

export const EMPTY_MENU_ITEM: MenuItemInput = {
  name: '',
  category: 'Main',
  price: 0,
  description: '',
  available: true,
};
