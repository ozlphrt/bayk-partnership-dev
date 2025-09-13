# BAYK Partnership Platform - Development Setup

## 🚀 Repository Structure

### **Stable Version (Production)**
- **Repository:** `sailing-club-partnership`
- **Branch:** `main`
- **Version:** v1.2 (Complete Neumorphism Design)
- **URL:** `https://ozlphrt.github.io/sailing-club-partnership`
- **Status:** ✅ Stable - Ready for team testing

### **Development Version (New Features)**
- **Repository:** `bayk-partnership-dev`
- **Branch:** `development`
- **Version:** v1.3+ (New Features)
- **URL:** `https://ozlphrt.github.io/bayk-partnership-dev`
- **Status:** 🔧 Development - New features being added

## 📋 Setup Instructions

### **1. Create Development Repository**
```bash
# Run the setup script
./create-dev-repo.sh
# or on Windows
create-dev-repo.bat
```

### **2. Manual Setup (Alternative)**
1. Go to: https://github.com/new
2. Repository name: `bayk-partnership-dev`
3. Description: `BAYK Partnership Platform - Development Version`
4. Make it **Public**
5. **Do NOT** initialize with README, .gitignore, or license
6. Click "Create repository"

### **3. Push Development Branch**
```bash
git remote add development https://github.com/ozlphrt/bayk-partnership-dev.git
git push development development:main
```

### **4. Enable GitHub Pages**
1. Go to: https://github.com/ozlphrt/bayk-partnership-dev/settings/pages
2. Source: Deploy from a branch
3. Branch: main
4. Folder: / (root)
5. Click "Save"

## 🔄 Development Workflow

### **Working on New Features**
```bash
# Switch to development branch
git checkout development

# Make your changes
# ... add new features ...

# Commit changes
git add .
git commit -m "Add new feature: [description]"

# Push to development repository
git push development development:main
```

### **Merging to Production**
```bash
# Switch to main branch
git checkout main

# Merge development changes
git merge development

# Tag new version
git tag -a v1.3 -m "Version 1.3 - [new features]"
git push origin main --tags

# Update production
git push origin main
```

## 📱 Testing URLs

### **Team Testing (Stable)**
- **URL:** `https://ozlphrt.github.io/sailing-club-partnership`
- **Version:** v1.2
- **Features:** Complete neumorphism design, PIN system
- **Status:** Ready for testing

### **Development Testing (New Features)**
- **URL:** `https://ozlphrt.github.io/bayk-partnership-dev`
- **Version:** v1.3+
- **Features:** New features being developed
- **Status:** Work in progress

## 🎯 Current Status

### **Version 1.2 (Stable)**
- ✅ Complete neumorphism design implementation
- ✅ BAYK branding with custom logo
- ✅ PIN code system (4-digit codes)
- ✅ All interfaces: main, member, partner, admin
- ✅ Mobile-optimized design
- ✅ Ready for team testing

### **Version 1.3+ (Development)**
- 🔧 New features being added
- 🔧 Enhanced functionality
- 🔧 Additional improvements
- 🔧 Experimental features

## 📞 Support

For questions about the development setup or new features, refer to this documentation or contact the development team.
