# Vercel Deployment

## GitHub

Create the repository:

```text
terraform-architecture-visualizer
```

Then:

```bash
git init
git branch -M main
git add .
git commit -m "Initial Terraform architecture visualizer"
git remote add origin https://github.com/rahul-k-21/terraform-architecture-visualizer.git
git push -u origin main
```

If the GitHub repository already contains a starter README and you intentionally want the local repository to replace it:

```bash
git push -u origin main --force
```

Only use `--force` when the remote history contains nothing you need.

## Vercel

1. Sign in to Vercel with GitHub.
2. Import `terraform-architecture-visualizer`.
3. Keep the detected Next.js framework settings.
4. Deploy.

Every push to the connected production branch can trigger a new deployment.

No AWS credentials are required by this application.

## Important

This project is a static analyzer. It does not run Terraform commands on the Vercel server and does not call AWS APIs.
