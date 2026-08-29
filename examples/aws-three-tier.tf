terraform {
  required_providers {
    aws = {
      source = "hashicorp/aws"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"
}

resource "aws_subnet" "public" {
  vpc_id = aws_vpc.main.id
  cidr_block = "10.0.1.0/24"
}

resource "aws_subnet" "private" {
  vpc_id = aws_vpc.main.id
  cidr_block = "10.0.2.0/24"
}

resource "aws_security_group" "web" {
  vpc_id = aws_vpc.main.id
}

resource "aws_instance" "web" {
  ami = "ami-example"
  instance_type = "t3.micro"
  subnet_id = aws_subnet.public.id
  vpc_security_group_ids = [aws_security_group.web.id]
}

resource "aws_db_instance" "database" {
  engine = "mysql"
  instance_class = "db.t3.micro"
  allocated_storage = 20
  db_subnet_group_name = aws_db_subnet_group.private.name
}

resource "aws_db_subnet_group" "private" {
  name = "private-subnets"
  subnet_ids = [aws_subnet.private.id]
}