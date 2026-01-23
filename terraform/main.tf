provider "aws" {
  region = local.region
}

locals {
  region = "us-east-1"
  repository_names = [
    "accounts",
    "cart",
    "frontend"
  ]
}

resource "aws_s3_bucket" "static" {
  bucket = "b2231430-static"
}

resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_support   = true
  enable_dns_hostnames = true
  tags                 = { Name = "east1-vpc" }
}

resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.main.id
}

resource "aws_subnet" "private_main" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.1.0/24"
  availability_zone = "us-east-1a"
  tags              = { Name = "private-main" }
}

resource "aws_subnet" "private_sub" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.2.0/24"
  availability_zone = "us-east-1b"
  tags              = { Name = "private-sub" }
}

resource "aws_db_subnet_group" "rds_sng" {
  name       = "rds-sng"
  subnet_ids = [aws_subnet.private_main.id, aws_subnet.private_sub.id]
}

data "aws_eks_cluster" "eks" {
  name = "peculiar-funk-dinosaur"
}

resource "aws_security_group" "rds_sg" {
  name   = "rds-sg"
  vpc_id = aws_vpc.main.id

  ingress {
    from_port       = 3306
    to_port         = 3306
    protocol        = "tcp"
    security_groups = [data.aws_eks_cluster.eks.vpc_config[0].cluster_security_group_id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_db_instance" "accounts" {
  identifier             = "accounts-db"
  db_name                = "accounts"
  engine                 = "mysql"
  instance_class         = "db.t3.micro"
  allocated_storage      = 2
  username               = "admin"
  password               = "f3zxsad7"
  db_subnet_group_name   = aws_db_subnet_group.rds_sng.name
  vpc_security_group_ids = [aws_security_group.rds_sg.id]
  availability_zone      = "us-east-1a"
  multi_az               = false
  skip_final_snapshot    = true
}


/*
====
ECR リポジトリの作成
====
*/

resource "aws_ecr_repository" "this" {
  for_each             = toset(local.repository_names)
  name                 = each.value
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  encryption_configuration {
    encryption_type = "AES256"
  }

  tags = {
    Environment = "Dev"
    Project     = "E-commerce"
  }
}
