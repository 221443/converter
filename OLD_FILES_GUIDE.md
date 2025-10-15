# Old Files - What to Keep and What to Remove

## ✅ Keep These Files

These files are still used or important:

### Configuration & Documentation
- `package.json` - ✅ UPDATED with Next.js dependencies
- `README.md` - ✅ Keep (consider updating)
- `TODO.md` - ✅ Keep
- `DEPLOYMENT.md` - ✅ Keep (still relevant)
- `.gitignore` - ✅ Keep
- `.prettierrc.json` - ✅ Keep
- `.eslintrc.json` - ✅ UPDATED for Next.js
- `postcss.config.js` - ✅ UPDATED for Tailwind
- `tailwind.config.js` - ✅ UPDATED for Next.js

### Tests
- `tests/` directory - ✅ Keep all test files
  - `fileHandler.test.js` - Still works!
  - `utils.test.js` - Still works!

### GitHub Actions
- `.github/workflows/ci-cd.yml` - ✅ UPDATED for Next.js

## ❌ Safe to Remove (Replaced by Next.js)

These files have been replaced and are no longer needed:

### Old HTML Files
- ❌ `index.html` - Replaced by `app/page.tsx`
- ❌ `converter.html` - Integrated into `app/page.tsx`
- ❌ `landing.html` - No longer needed

### Old JavaScript Files
- ❌ `app.js` - Replaced by `components/FileConverter.tsx`
- ❌ `converter.js` - Replaced by `lib/converter.ts`
- ❌ `fileHandler.js` - Replaced by `lib/fileHandler.ts`
- ❌ `utils.js` - Replaced by `lib/utils.ts`

### Old Config Files
- ❌ `vite.config.js` - Replaced by `next.config.js`
- ❌ `tsconfig.json` (old one) - Replaced with Next.js version

### Optional to Remove
- ❌ `analytics.js` - Not currently integrated (you can remove or integrate later)
- ❌ `converterAdvanced.js` - Not used in current implementation

## 🔄 How to Clean Up

### Option 1: Move to Archive (Safer)
```bash
mkdir old-files-backup
mv index.html converter.html landing.html old-files-backup/
mv app.js converter.js fileHandler.js utils.js old-files-backup/
mv vite.config.js old-files-backup/
mv analytics.js converterAdvanced.js old-files-backup/
```

### Option 2: Delete Directly
```bash
# Remove old HTML files
rm index.html converter.html landing.html

# Remove old JS files  
rm app.js converter.js fileHandler.js utils.js

# Remove old config
rm vite.config.js

# Remove unused features
rm analytics.js converterAdvanced.js
```

### Option 3: Git Rename/Remove
```bash
git rm index.html converter.html landing.html
git rm app.js converter.js fileHandler.js utils.js
git rm vite.config.js
git rm analytics.js converterAdvanced.js
git commit -m "Remove old Vite files, migrated to Next.js"
```

## 📦 New Files Added

These are the new Next.js files:

### Core Application
- ✅ `app/layout.tsx` - Root layout
- ✅ `app/page.tsx` - Home page
- ✅ `app/globals.css` - Global styles
- ✅ `components/FileConverter.tsx` - Main component
- ✅ `lib/converter.ts` - Conversion utilities
- ✅ `lib/fileHandler.ts` - File handling
- ✅ `lib/utils.ts` - Helper functions

### Configuration
- ✅ `next.config.js` - Next.js configuration
- ✅ `tsconfig.json` - TypeScript configuration

### Documentation
- ✅ `MIGRATION.md` - Migration guide
- ✅ `MIGRATION_COMPLETE.md` - Quick reference
- ✅ `OLD_FILES_GUIDE.md` - This file!

## 🎯 Recommended Cleanup Steps

1. **Test Everything First**
   ```bash
   npm run dev
   # Test all features in browser
   npm test
   # Make sure tests pass
   npm run build
   # Verify build succeeds
   ```

2. **Create Backup Branch**
   ```bash
   git checkout -b backup-before-cleanup
   git push origin backup-before-cleanup
   ```

3. **Remove Old Files**
   ```bash
   # Use one of the methods above
   ```

4. **Commit Changes**
   ```bash
   git add .
   git commit -m "Clean up old Vite files after Next.js migration"
   ```

5. **Update README.md**
   - Update installation instructions
   - Update development commands
   - Add Next.js information

## 🔍 Verification Checklist

Before deleting old files, verify:

- [ ] `npm run dev` works
- [ ] All conversion features work in browser
- [ ] `npm run build` completes successfully
- [ ] `npm test` passes
- [ ] GitHub Actions workflow is updated
- [ ] You have a backup (git branch or archive folder)

## 💡 If You Want to Integrate Old Features

### Analytics (analytics.js)
If you want to keep analytics:
1. Convert to TypeScript: `lib/analytics.ts`
2. Import in `components/FileConverter.tsx`
3. Add to component lifecycle

### Advanced Features (converterAdvanced.js)
If you want to keep advanced features:
1. Extract specific functions you need
2. Convert to TypeScript
3. Integrate into `lib/converter.ts`
4. Add UI controls in `FileConverter.tsx`

## 📚 Summary

### Must Keep
- All test files
- Configuration files (updated versions)
- Documentation files
- `.github/workflows/` directory

### Safe to Remove
- Old `.html` files (replaced by `.tsx`)
- Old `.js` files (replaced by `.ts/.tsx`)
- `vite.config.js` (replaced by `next.config.js`)

### Optional
- `analytics.js` - Remove or integrate
- `converterAdvanced.js` - Remove or integrate

---

**Note**: Always test before deleting! The old files are no longer needed but having a backup never hurts.
