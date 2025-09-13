#!/bin/bash

echo "Creating Development Repository for BAYK Partnership Platform"
echo

echo "Step 1: Create a new repository on GitHub"
echo "Please go to: https://github.com/new"
echo "Repository name: bayk-partnership-dev"
echo "Description: BAYK Partnership Platform - Development Version"
echo "Make it Public"
echo "Do NOT initialize with README, .gitignore, or license"
echo "Click 'Create repository'"
echo

echo "Step 2: After creating the repository, run this command:"
echo "git remote add development https://github.com/ozlphrt/bayk-partnership-dev.git"
echo "git push development development:main"
echo

echo "Step 3: Enable GitHub Pages for the development repository"
echo "Go to: https://github.com/ozlphrt/bayk-partnership-dev/settings/pages"
echo "Source: Deploy from a branch"
echo "Branch: main"
echo "Folder: / (root)"
echo "Click 'Save'"
echo

echo "Development URL will be: https://ozlphrt.github.io/bayk-partnership-dev"
echo

read -p "Press Enter to continue..."
