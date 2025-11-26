# TypeScript to JavaScript Conversion Guide

## Quick Conversion Steps

1. **Remove Type Annotations**
   - Remove `: Type` from variables, functions, parameters
   - Remove `<Type>` from generics
   - Remove `interface` and `type` declarations (or convert to JSDoc comments)

2. **Change File Extensions**
   - `.tsx` → `.jsx`
   - `.ts` → `.js`

3. **Update Imports**
   - Keep import/export syntax (ES6 modules work in JS)
   - Remove type-only imports

4. **Remove TypeScript-specific syntax**
   - `as Type` type assertions → remove or use JSDoc
   - `!` non-null assertions → remove
   - Optional chaining `?.` stays (works in JS)

## Example Conversion

### Before (TypeScript):
```typescript
interface User {
  name: string;
  email: string;
}

const getUser = (id: string): User | null => {
  return users.find(u => u.id === id) || null;
}
```

### After (JavaScript):
```javascript
/**
 * @typedef {Object} User
 * @property {string} name
 * @property {string} email
 */

const getUser = (id) => {
  return users.find(u => u.id === id) || null;
}
```

## Files Already Converted
- ✅ `src/contexts/auth-context.jsx`
- ✅ `src/pages/Auth.jsx`
- ✅ `src/lib/api.js`

## Files to Convert (Priority Order)
1. `src/App.tsx` → `src/App.jsx`
2. `src/main.tsx` → `src/main.jsx`
3. `src/pages/Home.tsx` → `src/pages/Home.jsx`
4. `src/pages/Product.tsx` → `src/pages/Product.jsx`
5. `src/pages/Category.tsx` → `src/pages/Category.jsx`
6. `src/pages/Cart.tsx` → `src/pages/Cart.jsx`
7. All context files
8. All component files
9. All data files

## After Conversion
1. Remove `tsconfig.json` files (or keep for IDE support)
2. Update `vite.config.ts` → `vite.config.js`
3. Remove TypeScript from `package.json` devDependencies (optional)
4. Update build scripts if needed

