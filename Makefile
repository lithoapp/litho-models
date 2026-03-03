.PHONY: sync plan apply deploy clean init destroy

sync:
	npx tsx scripts/sync-models.ts

plan:
	cd terraform && terraform plan

apply:
	cd terraform && terraform apply -auto-approve
	aws cloudfront create-invalidation --distribution-id $$(cd terraform && terraform output -raw cloudfront_distribution_id) --paths "/v1/models.json" --profile bit

deploy: sync
	aws s3 cp data/models.json s3://lithoapp-api/v1/models.json --content-type application/json --profile bit
	aws cloudfront create-invalidation --distribution-id $$(cd terraform && terraform output -raw cloudfront_distribution_id) --paths "/v1/models.json" --profile bit

init:
	cd terraform && terraform init

destroy:
	cd terraform && terraform destroy
