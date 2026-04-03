# ML Brain Trainer — Deployment Guide

## Option 1: Netlify (Recommended — free, mobile-ready in 2 mins)
1. Go to netlify.com → "Add new site" → "Deploy manually"
2. Drag & drop the `build/` folder into the drop zone
3. Done. You get a live URL instantly. Works on phone too.

## Option 2: Vercel (Also free, great performance)
1. npm install -g vercel
2. cd into this folder
3. Run: vercel --prod
4. Follow prompts. Done.

## Option 3: GitHub Pages (Free, permanent)
1. Push this repo to GitHub
2. In package.json add: "homepage": "https://yourusername.github.io/ml-quiz"
3. npm install --save-dev gh-pages
4. Add to scripts: "deploy": "gh-pages -d build"
5. Run: npm run build && npm run deploy

## Option 4: Serve locally on phone (quick test)
1. npm install -g serve
2. serve -s build -l 3000
3. Find your local IP (ifconfig / ipconfig)
4. On phone: go to http://YOUR_IP:3000

## To update questions:
Edit src/App.jsx → QUESTIONS array → npm run build → redeploy
