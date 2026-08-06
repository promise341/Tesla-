@echo off
echo ═══════════════════════════════════════════════════════════
echo    VERCEL SUPER ADMIN DEPLOYMENT
echo ═══════════════════════════════════════════════════════════
echo.

echo Step 1: Installing/Checking Vercel CLI...
call npm install -g vercel
echo.

echo Step 2: Login to Vercel (browser will open)...
call vercel login
echo.

echo Step 3: Linking project to Vercel...
cd /d c:\Projects\Tesla
call vercel link
echo.

echo ═══════════════════════════════════════════════════════════
echo    MANUAL STEPS REQUIRED
echo ═══════════════════════════════════════════════════════════
echo.
echo Before running the database migration, you need to:
echo.
echo 1. Go to Vercel Dashboard: https://vercel.com/dashboard
echo 2. Open your Tesla project
echo 3. Go to Settings ^> Environment Variables
echo 4. Copy the POSTGRES_PRISMA_URL value
echo.
echo Then create a file: .env.production.local
echo Add this line (replace with your URL):
echo POSTGRES_PRISMA_URL="your-production-database-url"
echo POSTGRES_URL_NON_POOLING="your-production-database-url"
echo.
echo Press any key when you've done this...
pause >nul
echo.

echo Step 4: Running database migration...
call npx prisma db push
echo.

echo Step 5: Generating Prisma client...
call npx prisma generate
echo.

echo Step 6: Creating SUPER ADMIN on production...
call vercel env pull .env.vercel.local
call vercel exec npm run seed:admin
echo.

echo ═══════════════════════════════════════════════════════════
echo    DEPLOYMENT COMPLETE!
echo ═══════════════════════════════════════════════════════════
echo.
echo ✅ SUPER ADMIN should now be active on production!
echo.
echo Login at: https://your-domain.vercel.app/login
echo Email: admin@teslacapx.com
echo Password: Admin@12345
echo.
echo ⚠️ REMEMBER TO:
echo - Delete .env.production.local file (security!)
echo - Change your password after first login
echo.
pause
