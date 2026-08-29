# Development Setup

## 1. Install Node.js

Use Node.js 20 or newer.

Verify:

```bash
node --version
npm --version
```

## 2. Install dependencies

```bash
npm install
```

## 3. Start development

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## 4. Production build

```bash
npm run build
npm start
```

## 5. Project layout

```text
app/
  page.tsx
  layout.tsx
  globals.css

components/
  TerraformVisualizer.tsx

lib/
  terraform-parser.ts

examples/
  aws-three-tier.tf
```
