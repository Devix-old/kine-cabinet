# 🚀 DevOps Workflow Guide for Kine-Cabinet

## Overview
This guide provides a complete DevOps workflow for safely updating, testing, and deploying your kine-cabinet application.

## 🏗️ Branch Strategy

### Main Branches
- **`main`** - Production branch (deploys to production)
- **`develop`** - Staging branch (deploys to staging)
- **`staging`** - Alternative staging branch

### Feature Branches
- **`feature/feature-name`** - New features
- **`bugfix/bug-description`** - Bug fixes
- **`hotfix/urgent-fix`** - Critical production fixes

## 📋 Step-by-Step Workflow

### 1. Local Development Best Practices

#### Before Starting Work
```bash
# Always start from the latest develop branch
git checkout develop
git pull origin develop

# Create a new feature branch
git checkout -b feature/your-feature-name
```

#### During Development
```bash
# Make your changes, then test locally
npm run test:local

# This runs:
# - Dependency installation
# - Linting
# - Type checking (if applicable)
# - Build process
# - Database migration checks
```

#### Before Committing
```bash
# Stage your changes
git add .

# Commit with descriptive message
git commit -m "feat: add patient search functionality

- Implement search by name and CIN
- Add debounced search input
- Update patient list UI
- Add search result highlighting"

# Push to your feature branch
git push origin feature/your-feature-name
```

### 2. Testing Changes Locally

#### Quick Test (Recommended)
```bash
npm run test:local
```

#### Manual Testing Checklist
- [ ] Application builds successfully
- [ ] No linting errors
- [ ] Database migrations work
- [ ] All pages load correctly
- [ ] API endpoints respond properly
- [ ] Authentication works
- [ ] Key user flows function

#### Database Testing
```bash
# Reset database to clean state
npm run db:reset

# Seed with test data
npm run db:seed

# Test your changes
npm run dev
```

### 3. Git Workflow Structure

#### Feature Development
```bash
# 1. Create feature branch from develop
git checkout develop
git pull origin develop
git checkout -b feature/new-feature

# 2. Develop and test
# ... make changes ...
npm run test:local

# 3. Commit changes
git add .
git commit -m "feat: implement new feature"

# 4. Push and create PR
git push origin feature/new-feature
# Create PR: feature/new-feature → develop
```

#### Bug Fixes
```bash
# 1. Create bugfix branch from develop
git checkout develop
git pull origin develop
git checkout -b bugfix/fix-description

# 2. Fix and test
# ... make changes ...
npm run test:local

# 3. Commit and push
git add .
git commit -m "fix: resolve issue with patient data loading"
git push origin bugfix/fix-description
# Create PR: bugfix/fix-description → develop
```

#### Hotfixes (Production Issues)
```bash
# 1. Create hotfix branch from main
git checkout main
git pull origin main
git checkout -b hotfix/critical-fix

# 2. Fix and test
# ... make changes ...
npm run test:local

# 3. Commit and push
git add .
git commit -m "hotfix: resolve critical authentication issue"
git push origin hotfix/critical-fix

# 4. Create PR to main AND develop
# PR1: hotfix/critical-fix → main
# PR2: hotfix/critical-fix → develop
```

### 4. Pull Request Process

#### PR Requirements
- [ ] All tests pass locally
- [ ] No linting errors
- [ ] Descriptive PR title and description
- [ ] Screenshots for UI changes
- [ ] Database migration files (if applicable)
- [ ] Environment variable updates documented

#### PR Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Local tests pass
- [ ] Manual testing completed
- [ ] Database migrations tested

## Screenshots (if applicable)
[Add screenshots here]

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] No console errors
- [ ] Responsive design tested
```

### 5. Automated Deployment

#### Staging Deployment
- **Trigger**: Push to `develop` branch
- **Environment**: Vercel staging
- **URL**: `https://kine-cabinet-staging.vercel.app`

#### Production Deployment
- **Trigger**: Push to `main` branch
- **Environment**: Vercel production
- **URL**: Your production domain

#### Deployment Process
1. GitHub Actions runs CI pipeline
2. Tests, linting, and build verification
3. Automatic deployment to appropriate environment
4. Health checks and monitoring

### 6. Staging Environment

#### Purpose
- Test changes before production
- Demo new features to stakeholders
- Integration testing
- Performance testing

#### Access
- Staging URL: `https://kine-cabinet-staging.vercel.app`
- Uses separate database (staging)
- Separate environment variables

#### Testing in Staging
1. Deploy to staging via `develop` branch
2. Test all functionality
3. Verify database changes
4. Check performance
5. Get stakeholder approval
6. Merge to `main` for production

### 7. Key Rules for Smooth Deployments

#### ✅ Always Do
- Run `npm run test:local` before pushing
- Use descriptive commit messages
- Create feature branches for all changes
- Test in staging before production
- Keep `main` branch stable
- Use pull requests for all changes
- Document breaking changes
- Update environment variables properly

#### ❌ Never Do
- Push directly to `main` branch
- Skip local testing
- Commit without descriptive messages
- Deploy untested code
- Ignore linting errors
- Forget database migrations
- Mix multiple features in one PR
- Deploy on Fridays (unless critical)

#### 🚨 Emergency Procedures
- For critical production issues, use hotfix branches
- Test hotfixes in staging first (if time permits)
- Document the issue and resolution
- Merge hotfix back to develop after main

## 🔧 Environment Setup

### Required Environment Variables
```bash
# Database
DATABASE_URL=postgresql://...

# Authentication
NEXTAUTH_SECRET=your-secret
NEXTAUTH_URL=http://localhost:3000

# Stripe (if using payments)
STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_SECRET_KEY=sk_...

# Other services
# Add your specific environment variables
```

### GitHub Secrets Required
- `VERCEL_TOKEN` - Vercel deployment token
- `VERCEL_ORG_ID` - Your Vercel organization ID
- `VERCEL_PROJECT_ID` - Your Vercel project ID

## 📊 Monitoring and Rollback

### Health Checks
- Application startup time
- Database connectivity
- API response times
- Error rates

### Rollback Procedure
1. Identify the problematic commit
2. Create hotfix branch from previous stable commit
3. Deploy hotfix to production
4. Investigate and fix the issue
5. Test fix in staging
6. Deploy proper fix

## 🎯 Quick Reference Commands

```bash
# Start development
npm run dev

# Test locally
npm run test:local

# Database operations
npm run db:push          # Push schema changes
npm run db:migrate       # Run migrations
npm run db:reset         # Reset database
npm run db:seed          # Seed with test data

# Git workflow
git checkout develop && git pull origin develop
git checkout -b feature/your-feature
# ... make changes ...
npm run test:local
git add . && git commit -m "feat: your changes"
git push origin feature/your-feature
# Create PR on GitHub
```

## 📞 Support

If you encounter issues:
1. Check the GitHub Actions logs
2. Verify environment variables
3. Test locally with `npm run test:local`
4. Check Vercel deployment logs
5. Review this documentation

Remember: **Test early, test often, deploy safely!** 🚀
