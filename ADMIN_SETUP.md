# Admin User Setup Guide

## 🔒 ENHANCED ADMIN SECURITY

**NEW: Multi-Factor Admin Authentication**
- Admin Password Verification
- Mathematical Challenge System  
- Time-Limited Security Sessions (2 hours)
- Session Monitoring & Auto-Logout

## Environment Variables Required

Add these to your `.env.local` file:

```bash
# Admin Master Password - Change this to your secure password!
ADMIN_MASTER_PASSWORD="TeslaCapX@Admin2024!"

# Admin JWT Secret - Change this to a random secure string!  
ADMIN_JWT_SECRET="ultra-secure-admin-jwt-secret-2024-change-this"
```

## 🔐 Admin Access Process

1. **Login normally** with admin credentials
2. **Enter Master Password** (set in environment variable)
3. **Solve Mathematical Challenge** (randomly generated)
4. **Access granted for 2 hours**

## Quick Commands

### Check Database Status
```bash
node scripts/check-data.js
```
Shows all users and transactions.

### Create Admin User
```bash
npm run seed:admin
```

### Create Test Users  
```bash
npm run seed:users
```

### Create Everything
```bash
npm run seed
```

### Update Admin Password
```bash
node scripts/update-admin-password.js
```

---

Run this command to automatically create an admin user:

```bash
npm run seed:admin
```

## Admin Credentials

After running the seed command, you'll get:

```
📧 Email:    admin@teslacapx.com
🔑 Password: Admin@12345
👤 Username: admin
🛡️ Master Password: TeslaCapX@Admin2024! (from .env.local)
```

## Access Admin Panel

1. **Open login page**: `http://localhost:3000/login`

2. **Enter basic credentials**:
   - Email/Username: `admin@teslacapx.com` (or `admin`)
   - Password: `Admin@12345`

3. **Click "Sign In"**

4. **Go to admin panel**: `http://localhost:3000/admin`

5. **🔒 Security Verification**:
   - Enter Master Password: `TeslaCapX@Admin2024!`
   - Solve Mathematical Challenge (e.g., `15 × 8 = ?`)
   - Access granted for 2 hours

---

## What the Admin User Can Do

- ✅ Approve/Reject pending deposits
- ✅ Approve/Reject pending withdrawals  
- ✅ Activate/Deactivate user accounts (affects login)
- ✅ Review and approve KYC documents
- ✅ View platform statistics
- ✅ View admin activity logs with full audit trail
- ✅ Monitor security sessions and access attempts

---

## 🛡️ Security Features

### Multi-Layer Protection
1. **Database Role Check**: User must have `role: "ADMIN"`
2. **Master Password**: Environment variable verification
3. **Math Challenge**: Random mathematical problems
4. **Session Tokens**: Secure JWT with 2-hour expiration
5. **Activity Logging**: All admin actions logged with details

### Auto-Logout Scenarios
- ❌ Security session expires (2 hours)
- ❌ Invalid security token detected
- ❌ 3 failed verification attempts
- ❌ Manual secure logout

### Session Monitoring
- Real-time session expiration timer
- Automatic re-verification required after expiration
- All access attempts logged for security audit

---

## Create Additional Admin Users

If you need more admin accounts, manually create them:

1. **Sign up a new account** normally
2. **Use Prisma Studio**:
   ```bash
   npx prisma studio
   ```
3. **Find the user** in the User table
4. **Change their `role` field from `"USER"` to `"ADMIN"`
5. **Refresh and log in**

---

## Reset Admin Password

If you want to change the admin password, update `scripts/seed-admin.js` line 8:

```javascript
const adminPassword = "YourNewPassword"; // Change this
```

Then run:
```bash
npm run seed:admin
```

The script will detect the admin already exists and show you the credentials.

---

## Troubleshooting

### "Admin user already exists" message

This means the admin account is already in your database. Just use:
- Email: `admin@teslacapx.com`
- Password: `Admin@12345`

To change credentials, update `scripts/seed-admin.js` and run again.

### Can't access admin panel after login

Make sure:
1. ✅ You're logged in
2. ✅ Your user's `role` is `"ADMIN"` (check in Prisma Studio)
3. ✅ Try refreshing the page

### "Admin access required" error

Your user doesn't have admin role. Update the user in database:
```bash
npx prisma studio
# Find your user → Change role to "ADMIN" → Save
```

---

## Test Workflow

1. **Create admin user**: `npm run seed:admin`
2. **Log in as admin**: Use credentials above → `/admin`
3. **Create regular test user**: Sign up another account normally
4. **Test approval workflow**:
   - Regular user requests deposit
   - Admin approves at `/admin/deposits`
   - User balance increases ✅
