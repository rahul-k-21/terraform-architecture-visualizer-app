# Application Architecture

```text
+---------------------------+
|        Vercel             |
|      Next.js App          |
+-------------+-------------+
              |
              v
+---------------------------+
| Terraform Source Editor   |
+-------------+-------------+
              |
              v
+---------------------------+
| Lightweight HCL Resource  |
| Detection / Reference     |
| Analysis                  |
+-------------+-------------+
              |
              v
+---------------------------+
| Terraform Resource Model  |
+-------------+-------------+
              |
        +-----+-----+
        |           |
        v           v
 Resource List   Graph View
        |
        v
 Resource Details
```

## Safety boundary

The application never:

- stores AWS access keys
- executes `terraform init`
- executes `terraform plan`
- executes `terraform apply`
- changes AWS resources

The parser runs client-side.

## Production extension

A future backend could accept a user-provided Terraform plan JSON document generated with:

```bash
terraform show -json tfplan > tfplan.json
```

That would provide a more authoritative representation of planned resource changes than source-code regex analysis.
