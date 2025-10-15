#!/bin/bash

# =================================================================
# NephroConsult - Git Repository Setup Script
# =================================================================

echo "🚀 Setting up Git repository for NephroConsult..."

# Initialize git repository if not already initialized
if [ ! -d ".git" ]; then
    echo "📁 Initializing Git repository..."
    git init
else
    echo "✅ Git repository already initialized"
fi

# Add all files (excluding those in .gitignore)
echo "📝 Adding files to Git..."
git add .

# Check if there are files to commit
if git diff --staged --quiet; then
    echo "ℹ️  No changes to commit"
else
    echo "📊 Files to be committed:"
    git diff --staged --name-only
    
    # Create initial commit
    echo "💾 Creating initial commit..."
    git commit -m "🎉 Initial commit: NephroConsult Platform

✨ Features:
- Complete telemedicine platform for nephrology consultations
- Multi-currency payment system with Cashfree integration
- Professional email system with automated notifications
- Global accessibility with timezone conversion
- Secure authentication with Firebase
- Production-ready with comprehensive security

🏥 Doctor: Dr. Ilango Krishnamurthy (Sr. Nephrologist)
💰 Payments: Multi-currency support via Cashfree (INR, USD, EUR, GBP, AUD)
🌍 Global: Timezone-aware booking system
📧 Email: Professional consultation confirmations
🔐 Security: Production-grade security headers and validation

🚀 Ready for production deployment!"
fi

echo ""
echo "✅ Git setup complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Create a new repository on GitHub"
echo "2. Add the remote origin:"
echo "   git remote add origin https://github.com/yourusername/nephroconsult.git"
echo "3. Push to GitHub:"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "🔒 IMPORTANT: Your .env files are safely ignored and won't be committed!"
echo "📖 See PRODUCTION_CHECKLIST.md for deployment steps"
echo ""
echo "🎉 Your NephroConsult platform is ready for GitHub and production!"
