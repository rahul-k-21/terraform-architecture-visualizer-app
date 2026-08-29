# Terraform Plan JSON

For a production-grade analysis workflow, generate a Terraform plan locally:

```bash
terraform plan -out=tfplan
terraform show -json tfplan > tfplan.json
```

The application can later be extended to accept `tfplan.json`.

Terraform's JSON plan representation includes `resource_changes`, planned values, configuration, modules, and references. This is preferable when the goal is to show exactly what Terraform plans to create, update, replace, or destroy.

Do not commit `tfplan` or `tfplan.json` to Git. Plan files can contain sensitive data.
