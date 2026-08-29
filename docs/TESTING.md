# Testing Checklist

## UI

- [ ] Application loads at `/`
- [ ] Sample Terraform is visible
- [ ] Clear button removes code
- [ ] Load Example restores sample
- [ ] Resource count updates while typing
- [ ] Resource rows are clickable
- [ ] Resource details update
- [ ] JSON export works
- [ ] Download model works
- [ ] Mobile layout is usable

## Parser

Test:

```hcl
resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"
}
```

Expected:

```text
Resource: aws_vpc.main
Type: aws_vpc
Provider: aws
```

Test a dependency:

```hcl
resource "aws_subnet" "public" {
  vpc_id = aws_vpc.main.id
}
```

Expected edge:

```text
aws_subnet.public -> aws_vpc.main
```

## Production safety

- [ ] No `.env` committed
- [ ] No AWS access keys committed
- [ ] No Terraform state committed
- [ ] No Terraform plan files committed
