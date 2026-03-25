-- Step 1: Modify categories table to make userId nullable
ALTER TABLE categories 
ALTER COLUMN "userId" DROP NOT NULL;

-- Step 2: Delete all existing categories (starting fresh)
DELETE FROM categories;

-- Step 3: Insert 11 shared default categories with userId = NULL
INSERT INTO categories ("userId", name, type, color, "isDefault") VALUES
  (NULL, 'Insumos',          'expense', '#ef4444', true),
  (NULL, 'Mano de obra',     'expense', '#f97316', true),
  (NULL, 'Mantenimiento',    'expense', '#eab308', true),
  (NULL, 'Transporte',       'expense', '#3b82f6', true),
  (NULL, 'Agroquimicos',     'expense', '#8b5cf6', true),
  (NULL, 'Herramientas',     'expense', '#06b6d4', true),
  (NULL, 'Agua / Riego',     'expense', '#0ea5e9', true),
  (NULL, 'Otros gastos',     'expense', '#6b7280', true),
  (NULL, 'Venta de cosecha', 'income',  '#22c55e', true),
  (NULL, 'Subsidios',        'income',  '#84cc16', true),
  (NULL, 'Otros ingresos',   'income',  '#10b981', true);
