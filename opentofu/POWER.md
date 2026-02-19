---
name: "opentofu"
displayName: "Deploy infrastructure with OpenTofu"
description: "Build and manage Infrastructure as Code with OpenTofu - access registry providers and modules, manage state, and execute tofu workflows using the open-source Terraform-compatible toolchain"
keywords: ["opentofu", "tofu", "terraform", "infrastructure", "IaC", "providers", "modules", "registry", "open-source"]
author: "OpenTofu"
---

# OpenTofu Power

## Overview

Access Terraform Registry APIs for IaC development with OpenTofu. Search provider docs, discover modules, and manage infrastructure with the open-source `tofu` CLI.

OpenTofu is an open-source fork of Terraform (MPL-2.0 licensed) that is fully compatible with Terraform provider and module registries. Use this power instead of the Terraform Power when working with OpenTofu.

**Key capabilities:**
- **Provider Documentation**: Search and retrieve docs for resources, data sources, functions
- **Module Discovery**: Find verified and community modules from the Registry
- **OpenTofu CLI**: Full `tofu` workflow (init, validate, plan, apply)
- **Registry Compatibility**: Works with both `registry.opentofu.org` and `registry.terraform.io`

> **Why not the Terraform Power?** The Terraform Power includes HCP Terraform workspace management tools that are specific to HashiCorp's commercial platform and are not applicable to OpenTofu. This power is focused on the open-source OpenTofu toolchain and excludes HCP Terraform features.

## Available Steering Files

- **getting-started** - Interactive setup guide for new OpenTofu projects
- **opentofu-best-practices** - Coding conventions and patterns (auto-loads for .tf files)

## Available MCP Servers

### terraform
**Package:** `hashicorp/terraform-mcp-server` | **Connection:** Docker stdio

> **Note:** Only the registry tools (providers, modules) are applicable for OpenTofu. HCP Terraform tools (`list_terraform_orgs`, `list_workspaces`, `create_run`, etc.) are specific to HashiCorp's platform and should not be used with OpenTofu.

**Provider Tools:**

| Tool | Purpose | Returns |
|------|---------|---------|
| `search_providers` | Find provider documentation by service name | List of available documentation with IDs, titles, and categories |
| `get_provider_details` | Retrieve complete documentation for a specific provider component | Full documentation content in markdown format |
| `get_latest_provider_version` | Retrieve the latest version of a specific provider | The latest version of a provider |

**Module Tools:**

| Tool | Purpose | Returns |
|------|---------|---------|
| `search_modules` | Find modules by name or functionality | Module details including names, descriptions, download counts, and verification status |
| `get_module_details` | Get comprehensive module information | Complete documentation with inputs, outputs, examples, and submodules |
| `get_latest_module_version` | Retrieve the latest version of a specific module | The latest version of a module |

**Policy Tools:**

| Tool | Purpose | Returns |
|------|---------|---------|
| `search_policies` | Find Sentinel policies by topic or requirement | Policy listings with IDs, names, and download statistics |
| `get_policy_details` | Retrieve detailed policy documentation | Policy implementation details and usage instructions |

## Examples

```javascript
// 1. Search for S3 bucket resource docs
search_providers({
  "provider_name": "aws",
  "provider_namespace": "hashicorp",
  "service_slug": "s3_bucket",
  "provider_document_type": "resources"
})
// Returns: provider_doc_id like "10735923"

// 2. Get full documentation
get_provider_details({ "provider_doc_id": "10735923" })

// 3. Search for VPC modules
search_modules({ "module_query": "vpc" })
// Returns: module_id like "terraform-aws-modules/vpc/aws/6.5.1"

// 4. Get module details
get_module_details({ "module_id": "terraform-aws-modules/vpc/aws/6.5.1" })

// 5. Get latest provider version
get_latest_provider_version({ "namespace": "hashicorp", "name": "aws" })
```

## Workflow: Research → Write Config

```javascript
// Step 1: Search provider docs
const results = search_providers({
  "provider_name": "aws",
  "provider_namespace": "hashicorp",
  "service_slug": "lambda_function",
  "provider_document_type": "resources"
})

// Step 2: Get detailed docs using provider_doc_id from results
const docs = get_provider_details({ "provider_doc_id": "..." })

// Step 3: Get version for constraint
const version = get_latest_provider_version({ "namespace": "hashicorp", "name": "aws" })

// Now write accurate OpenTofu config using tofu CLI
```

## Configuration

**Prerequisites:** Docker installed and running, OpenTofu CLI (`tofu`) installed

### OpenTofu CLI Workflow

```bash
tofu init      # Initialize working directory
tofu validate  # Validate configuration
tofu plan      # Preview changes
tofu apply     # Apply changes
tofu destroy   # Destroy infrastructure
tofu fmt       # Format configuration files
```

### OpenTofu vs Terraform CLI

OpenTofu uses the `tofu` command instead of `terraform`. The flags and subcommands are largely identical:

| Terraform | OpenTofu | Notes |
|-----------|----------|-------|
| `terraform init` | `tofu init` | Identical behavior |
| `terraform plan` | `tofu plan` | Identical behavior |
| `terraform apply` | `tofu apply` | Identical behavior |
| `terraform destroy` | `tofu destroy` | Identical behavior |
| `terraform fmt` | `tofu fmt` | Identical behavior |
| `terraform validate` | `tofu validate` | Identical behavior |
| `terraform state` | `tofu state` | Identical behavior |
| `terraform providers` | `tofu providers` | Identical behavior |

### OpenTofu-Specific Features

OpenTofu has additional features not present in Terraform:

- **Provider-defined functions** - Call functions defined by providers
- **`tofu test`** - Built-in testing framework (compatible with Terraform test syntax)
- **`removed` block** - Remove resources from state without destroying them
- **Registry**: OpenTofu has its own registry at `registry.opentofu.org` (also compatible with `registry.terraform.io`)

### Version Block

Both `terraform` and `opentofu` blocks are supported:

```hcl
# Standard (recommended for maximum compatibility)
terraform {
  required_version = ">= 1.8"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}
```

## Best Practices

**Do:** Always `search_*` before `get_*_details`, pin versions, use modules, review plans

**Don't:** Hardcode credentials, skip plan review, use `auto_approve` blindly, use HCP Terraform tools (they are not applicable for OpenTofu)

## Troubleshooting

| Error | Solution |
|-------|----------|
| Provider/Module not found | Use `search_*` first to get valid IDs |
| Docker not running | Start Docker daemon |
| `tofu: command not found` | Install OpenTofu: https://opentofu.org/docs/intro/install/ |
| Provider version mismatch | Run `tofu init -upgrade` to update providers |
| State lock error | Ensure no other `tofu` process is running; use `tofu force-unlock <lock-id>` if stale |

## Resources

[OpenTofu Docs](https://opentofu.org/docs/) · [OpenTofu Registry](https://registry.opentofu.org) · [Terraform Registry](https://registry.terraform.io) · [MCP Server repo](https://github.com/hashicorp/terraform-mcp-server) · [OpenTofu GitHub](https://github.com/opentofu/opentofu)

---

**MCP Package:** `hashicorp/terraform-mcp-server` | **OpenTofu License:** MPL-2.0
