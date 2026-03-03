variable "aws_profile" {
  description = "AWS CLI profile to use for authentication"
  type        = string
  default     = "bit"
}

variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-east-1"
}

variable "bucket_name" {
  description = "Name of the S3 bucket for the API"
  type        = string
  default     = "lithoapp-api"
}

variable "environment" {
  description = "Environment name (e.g., prod, staging)"
  type        = string
  default     = "prod"
}

variable "project_name" {
  description = "Project name for resource tagging"
  type        = string
  default     = "litho-models"
}

variable "domain_name" {
  description = "Domain name for the API"
  type        = string
  default     = "api.lithoapp.com"
}

variable "hosted_zone_id" {
  description = "Route53 hosted zone ID for the domain"
  type        = string
  default     = "Z06040992GKLURA28TMD4"
}

variable "cache_default_ttl" {
  description = "Default TTL for CloudFront cache in seconds (1 hour = 3600)"
  type        = number
  default     = 3600
}
