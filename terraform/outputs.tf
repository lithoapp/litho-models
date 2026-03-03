output "s3_bucket_name" {
  description = "Name of the S3 bucket"
  value       = aws_s3_bucket.api.id
}

output "s3_bucket_arn" {
  description = "ARN of the S3 bucket"
  value       = aws_s3_bucket.api.arn
}

output "s3_bucket_regional_domain_name" {
  description = "Regional domain name of the S3 bucket"
  value       = aws_s3_bucket.api.bucket_regional_domain_name
}

output "cloudfront_distribution_id" {
  description = "ID of the CloudFront distribution (needed for cache invalidation)"
  value       = aws_cloudfront_distribution.api.id
}

output "cloudfront_distribution_arn" {
  description = "ARN of the CloudFront distribution"
  value       = aws_cloudfront_distribution.api.arn
}

output "cloudfront_domain_name" {
  description = "Domain name of the CloudFront distribution"
  value       = aws_cloudfront_distribution.api.domain_name
}

output "api_url" {
  description = "Full HTTPS URL for the API"
  value       = "https://${var.domain_name}"
}

output "models_url" {
  description = "Full HTTPS URL for the models.json endpoint"
  value       = "https://${var.domain_name}/v1/models.json"
}

output "deploy_command" {
  description = "Command to deploy updated models.json"
  value       = "aws s3 cp data/models.json s3://${aws_s3_bucket.api.id}/v1/models.json --content-type application/json --profile ${var.aws_profile}"
}

output "invalidation_command" {
  description = "Command to invalidate CloudFront cache"
  value       = "aws cloudfront create-invalidation --distribution-id ${aws_cloudfront_distribution.api.id} --paths \"/v1/models.json\" --profile ${var.aws_profile}"
}

output "certificate_arn" {
  description = "ARN of the ACM certificate"
  value       = aws_acm_certificate.api.arn
}

output "domain_name" {
  description = "Custom domain name"
  value       = var.domain_name
}
