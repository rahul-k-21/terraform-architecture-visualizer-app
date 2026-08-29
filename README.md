# Terraform Architecture Visualizer

A GitHub-ready Next.js application that analyzes Terraform configuration and visualizes the infrastructure resources and relationships it can infer from the source.

## Why this project?

Terraform tells you what infrastructure will be managed, but large `.tf` files can be difficult to reason about visually. This tool gives a fast architecture-oriented view before you run Terraform.

### Features

- Paste Terraform `.tf` configuration
- Detect Terraform `resource` blocks
- Detect providers
- Show resource addresses, types and source lines
- Infer common resource-to-resource references
- Interactive resource details panel
- Export the analyzed model as JSON
- Built-in AWS three-tier example
- Responsive UI
- Deployable to Vercel
- No AWS credentials required
- Does **not** execute `terraform apply`

## Architecture

```text
Browser
  |
  v
Next.js / React
  |
  +--> Terraform source parser
  |
  +--> Resource model
  |
  +--> Dependency inference
  |
  +--> Interactive architecture graph
```

The first version intentionally performs static analysis in the browser. This keeps the public Vercel deployment safe: it does not need cloud credentials and cannot create infrastructure.

## Local development

Requirements:

- Node.js 20+
- npm

```bash
git clone https://github.com/rahul-k-21/terraform-architecture-visualizer.git
cd terraform-architecture-visualizer
npm install
npm run dev
```

Open `http://localhost:3000`.

## Build

```bash
npm run build
npm start
```

## Deploy to Vercel

Push the repository to GitHub, then import it into Vercel. Vercel automatically detects a Next.js application.

Typical settings:

- Framework: Next.js
- Build command: `npm run build`
- Output directory: default
- Install command: `npm install`

No environment variables are required for the current version.

## What the analyzer supports

The parser recognizes native Terraform resource blocks such as:

```hcl
resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"
}
```

and common references such as:

```hcl
subnet_id = aws_subnet.public.id
```

This is intentionally a lightweight visualization parser, not a replacement for Terraform's own HCL parser or plan engine.

## Future roadmap

- Terraform plan JSON upload
- `terraform show -json` import
- Module tree visualization
- Data source detection
- Variable and output analysis
- Provider/resource filtering
- Resource grouping by VPC/subnet/layer
- Cost-estimation integration
- HCP Terraform integration
- Export SVG/PNG
- Policy/security checks
- Multi-cloud resource icons

## Security

Do not upload Terraform files containing secrets. Terraform plan files can also contain sensitive information, so they should not be committed to Git or casually uploaded.

This application does not execute Terraform and does not request AWS access keys.

## Git workflow

```bash
git add .
git commit -m "Build Terraform architecture visualizer"
git push origin main
```

## License

MIT
