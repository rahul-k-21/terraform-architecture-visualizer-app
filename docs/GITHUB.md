# GitHub Workflow

## First push

```bash
git init
git branch -M main
git add .
git commit -m "Initial Terraform architecture visualizer"
git remote add origin https://github.com/rahul-k-21/terraform-architecture-visualizer.git
git push -u origin main
```

## Existing remote with unrelated history

If GitHub has only an automatically created README:

```bash
git pull origin main --allow-unrelated-histories
```

Resolve conflicts, commit, then:

```bash
git push -u origin main
```

If the remote contains nothing important and local should completely replace it:

```bash
git push -u origin main --force
```
