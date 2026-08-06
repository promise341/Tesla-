# 🛡️ SUPER ADMIN SETUP GUIDE

## What is a SUPER ADMIN?

The **SUPER ADMIN** is an immutable, invisible administrator account with supreme authority over the platform. This account was created to prevent other admins from deleting or modifying the main admin account.

### 🔒 SUPER ADMIN Features

1. **✅ IMMUTABLE** - Cannot be deleted, suspended, or modified by anyone (including other admins)
2. **✅ INVISIBLE** - Does NOT appear in the admin users list at `/admin/users`
3. **✅ SUPREME AUTHORITY** - Has full control over all users, including other admins
4. **✅ PROTECTED OPERATIONS** - All admin API endpoints check for `isSuperAdmin` flag before allowing modifications

---

## 🚀 Setup Instructions

### Step 1: Generate Prisma Client with New Schema

The database schema has been updated to include the `isSuperAdmin` field. You need to push this to your database and regenerate the Prisma client:

```bash
npx prisma db push
```

This will:
- Add the `isSuperAdmin` boolean field to the User table
- Set default value to `false` for all existing users
- Regenerate the Prisma client

### Step 2: Create/Upgrade SUPER ADMIN Account

Run the seed script to create or upgrade your admin account:

```bash
npm run seed:admin
```

This will:
- **If admin exists**: Upgrade the existing `admin@teslacapx.com` to SUPER ADMIN
- **If admin doesn't exist**: Create a new SUPER ADMIN account

---

## 📋 SUPER ADMIN Credentials

After running the seed script, use these credentials:

```
📧 Email:    admin@teslacapx.com
🔑 Password: Admin@12345
👤 Username: admin
```

**⚠️ IMPORTANT: Change the password after first login for security!**

---

## 🛡️ Protection Details

### What SUPER ADMIN Can Do:
- ✅ View ALL users (except won't see themselves in the list)
- ✅ Delete any regular user
- ✅ Suspend/activate any regular user
- ✅ Change roles of any regular user
- ✅ Credit/debit any regular user's balance
- ✅ Access all admin features

### What Other Admins CANNOT Do to SUPER ADMIN:
- ❌ Delete the SUPER ADMIN account
- ❌ Suspend the SUPER ADMIN account
- ❌ Modify SUPER ADMIN's role
- ❌ Change SUPER ADMIN's balance
- ❌ Even see the SUPER ADMIN in the users list

### Protected API Endpoints:
All these endpoints now check `isSuperAdmin` before allowing modifications:

1. **PUT `/api/admin/users`** - Role change / suspend
   - Returns 403 error if target user is SUPER ADMIN
   
2. **DELETE `/api/admin/users`** - Delete user
   - Returns 403 error if target user is SUPER ADMIN
   
3. **PATCH `/api/admin/users`** - Credit/debit balance
   - Returns 403 error if target user is SUPER ADMIN

4. **GET `/api/admin/users`** - List users
   - Automatically filters out users with `isSuperAdmin: true`

---

## 🔐 Security Best Practices

1. **Change the default password** immediately after setup
2. **Never share** SUPER ADMIN credentials with anyone
3. **Use strong passwords** (combination of letters, numbers, symbols)
4. **Enable 2FA** if you add that feature in the future
5. **Monitor logs** regularly for suspicious activity

---

## 🆘 Troubleshooting

### Issue: "Can't create SUPER ADMIN - field doesn't exist"

Run this first:
```bash
npx prisma db push
```

Then run:
```bash
npm run seed:admin
```

### Issue: "Admin already exists" but I need to upgrade them

The script automatically detects existing admins and upgrades them to SUPER ADMIN. Just run:
```bash
npm run seed:admin
```

### Issue: I can see the SUPER ADMIN in the users list

This shouldn't happen, but if it does, check:
1. Make sure you've pushed the latest schema: `npx prisma db push`
2. Restart your dev server: `npm run dev`
3. Clear browser cache and refresh

### Issue: Another admin deleted my SUPER ADMIN account

This is **impossible** now. The API will return a 403 error if anyone tries to:
- Delete a SUPER ADMIN
- Suspend a SUPER ADMIN  
- Modify a SUPER ADMIN's role or balance

If you somehow lost access, you can recreate the account by running:
```bash
npm run seed:admin
```

---

## 📊 Testing the Protection

Want to verify it's working? Try these tests:

### Test 1: SUPER ADMIN is hidden from users list
1. Login as SUPER ADMIN
2. Go to `/admin/users`
3. Search for your own email - you won't find it ✅

### Test 2: Regular admin can't modify SUPER ADMIN
1. Create another admin user (set role to "ADMIN")
2. Login as that admin
3. Try to delete or suspend the SUPER ADMIN - you'll get "Access Denied" ✅

### Test 3: API protection works
Try this in browser console (while logged in as regular admin):
```javascript
fetch('/api/admin/users?userId=<super-admin-id>', { method: 'DELETE' })
  .then(r => r.json())
  .then(console.log)
// Should return: { error: "Access Denied: This account cannot be deleted" }
```

---

## 🔄 Reverting Changes (If Needed)

If you need to remove the SUPER ADMIN protection:

1. Remove the `isSuperAdmin` field from `prisma/schema.prisma`
2. Run `npx prisma db push`
3. Remove the protection checks from `app/api/admin/users/route.ts`

**⚠️ NOT RECOMMENDED** - This removes all protection!

---

## 📞 Support

If you have issues:
1. Check the Prisma client is generated: `npx prisma generate`
2. Check the database schema: `npx prisma studio`
3. Check server logs for detailed error messages

---

**🎉 You're all set! Your admin account is now protected.**
