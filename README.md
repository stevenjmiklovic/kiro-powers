# Kiro powers repository

Collection of Kiro powers for enhanced AI agent capabilities. Each power provides specialized tools and workflows for specific development tasks.

Documentation is available at https://kiro.dev/docs/powers/

## Available powers

### arm-soc-migration
**Perform Migration between Arm SoC** - Guides migration of code from one Arm-based SoC to another with architecture-aware analysis, HAL identification, and safe refactoring across scenarios like Graviton, i.MX8, Jetson Orin, Snapdragon, and STM32MP1.

**MCP Servers:** arm-mcp-server

---

### atlassian
**Atlassian Admin** - Manage Jira projects, issues, and sprints alongside Confluence spaces and pages - plan work, track bugs, and document everything using the official Atlassian MCP server.

**MCP Servers:** atlassian (Remote MCP via SSE)

---

### aws-agentcore
**Build an agent with Amazon Bedrock AgentCore** - Build, test, and deploy AI agents using AWS Bedrock AgentCore with local development workflow. Amazon Bedrock AgentCore is an agentic platform for building, deploying, and operating effective agents.

**MCP Servers:** agentcore-mcp-server

---

### aws-amplify
**Build full-stack apps with AWS Amplify** - Build and extend full-stack applications with AWS Amplify Gen 2 using type-safe TypeScript, guided workflows, and best practices. Covers authentication, data models, storage, serverless functions, AI/ML integration, and deployment to sandbox and production.

**MCP Servers:** aws-mcp

---

### aws-devops-agent
**AWS DevOps Agent** - AI agent for AWS operational intelligence via the AWS MCP Server. Investigate incidents, optimize costs, review architecture, map topology, and get remediation using DevOps Agent APIs.

**MCP Servers:** aws-mcp

---

### aws-graviton-migration
**Graviton Migration Power** - Analyze source code, Dockerfiles, and dependency manifests for AWS Graviton (Arm64) compatibility. Generates reports with minimal required and recommended versions for language runtimes and libraries, plus optimization suggestions.

**MCP Servers:** arm-mcp

---

### aws-healthomics
**Create and Manage Bioinformatics Workflows with AWS HealthOmics** - create, migrate, run, debug and identify optimization opportunities for bioinformatics workflows in AWS HealthOmics.

**MCP Servers:** awslabs.aws-healthomics-mcp-server

---

### aws-infrastructure-as-code
**Build AWS infrastructure with CDK and CloudFormation** - Generate well-architected AWS infrastructure with CDK and CloudFormation - access latest documentation, validate templates, and troubleshoot deployments.

**MCP Servers:** awslabs.aws-iac-mcp-server

---

### aws-mcp
**Work with AWS** - Perform complex, multi-step AWS tasks by combining real-time documentation access, syntactically correct API calls, and pre-built Agent SOPs that follow AWS best practices.

**MCP Servers:** aws-mcp

---

### aws-observability
**AWS Observability** - Comprehensive observability platform combining CloudWatch Logs, Metrics, Alarms, Application Signals (APM), CloudTrail auditing, Amazon Managed Prometheus, and codebase observability gap analysis for end-to-end monitoring and troubleshooting.

**MCP Servers:** awslabs.cloudwatch-mcp-server, awslabs.cloudwatch-applicationsignals-mcp-server, awslabs.cloudtrail-mcp-server, awslabs.prometheus-mcp-server, awslabs.aws-documentation-mcp-server

---

### aws-sam
**Build serverless applications with AWS SAM** - Build, test, and deploy serverless applications using AWS Serverless Application Model (SAM) with local development workflow and MCP tooling.

**MCP Servers:** awslabs.aws-serverless-mcp-server, fetch

---

### aws-step-functions
**AWS Step Functions** - Build workflows with AWS Step Functions state machines using the JSONata query language. Covers Amazon States Language (ASL) structure, state types, variables, data transformation, error handling, service integration, and migrating from JSONPath to JSONata.

**MCP Servers:** None (Knowledge Base Power)

---

### aws-transform
**Agents modernizing the world's infrastructure and software**, backed by years of AWS expertise. AWS Transform is a full modernization factory — connecting assessment through execution in a single experience, so the manual handoffs and lost context that commonly stall large-scale migrations and ongoing tech debt reduction no longer slow you down. This power brings AWS Transform directly into Kiro. AWS Transform custom is the first supported capability, with more playbooks on the way. Find out more at [aws.amazon.com/transform](https://aws.amazon.com/transform/)

**MCP Servers:** None

---

### checkout
**Checkout.com Global Payments** - Access Checkout.com's comprehensive API documentation with intelligent search and detailed operation information for payments, customers, disputes, issuing, platforms, workflows, and identity verification.

**MCP Servers:** checkout-dx (HTTPS API)

---

### cloud-architect
**Build infrastructure on AWS** - Build AWS infrastructure with CDK in Python following AWS Well-Architected framework best practices.

**MCP Servers:** awspricing, awsknowledge, awsapi, context7, fetch

---

### cloudwatch-application-signals
**Amazon CloudWatch Application Signals** - Monitor service health, analyze SLO compliance, and perform root cause analysis with distributed tracing and audit capabilities.

**MCP Servers:** awslabs.cloudwatch-applicationsignals-mcp-server

---

### datadog
**Datadog Observability** - Query logs, metrics, traces, RUM events, incidents, and monitors from Datadog for production debugging and performance analysis.

**MCP Servers:** datadog (HTTPS API)

---

### discord
**Discord Communication** - Integrate two-way Discord communication into your workflows - send and read messages, manage channels, search conversations, and connect with your Discord Bot for real-time server collaboration.

**MCP Servers:** discord

---

### dynatrace
**Dynatrace Observability** - Query logs, metrics, traces, problems, and security vulnerabilities using DQL (Dynatrace Query Language) and Davis AI.

**MCP Servers:** dynatrace-mcp-server

---

### gcp-aws-migrate
**GCP to AWS Migration Advisor** - Guided 5-phase migration from Google Cloud Platform to AWS covering Terraform discovery, requirements, AWS architecture design, cost estimation, and execution planning. A no-cost tool that assesses cloud usage, geography, and billing to compare AWS services and pricing.

**MCP Servers:** awsknowledge, awspricing

---

### library-prompt-library
**Library Prompt Library** - A Dewey Decimal-inspired catalog index for creating, storing, sharing, and searching organizational prompts. Designed for academic library staff and the DRCC at Johns Hopkins.

**MCP Servers:** None (Knowledge Base Power)

---

### neon
**Build a database with Neon** - Serverless Postgres with database branching, autoscaling, and scale-to-zero - perfect for modern development workflows.

**MCP Servers:** neon

---

### opentofu
**Deploy infrastructure with OpenTofu** - Build and manage Infrastructure as Code with OpenTofu - access registry providers and modules, manage state, and execute tofu workflows using the open-source Terraform-compatible toolchain.

**MCP Servers:** opentofu (SSE)

---

### postman
**API Testing with Postman** - Automate API testing and collection management with Postman - create workspaces, collections, environments, and run tests programmatically.

**MCP Servers:** postman

---

### power-builder
**Power Builder** - Complete guide for building and testing new Kiro powers with templates, best practices, and validation.

**MCP Servers:** None (Knowledge Base Power)

---

### saas-builder
**SaaS Builder** - Build production-ready multi-tenant SaaS applications with serverless architecture, integrated billing, and enterprise-grade security.

**MCP Servers:** fetch, stripe, aws-knowledge-mcp-server, awslabs.dynamodb-mcp-server, awslabs.aws-serverless-mcp, playwright

---

### slack
**Slack Communication** - Integrate two-way Slack communication into your workflows - send and read messages, manage channels, search conversations, and connect with your Slack App for real-time org collaboration.

**MCP Servers:** slack (Remote MCP via SSE)

---

### spark-troubleshooting-agent
**Troubleshoot Spark applications on AWS** - Troubleshoot Spark applications on AWS EMR, Glue, and SageMaker - analyze failures, identify bottlenecks, and get code recommendations.

**MCP Servers:** sagemaker-unified-studio-mcp-troubleshooting, sagemaker-unified-studio-mcp-code-rec

---

### stackgen
**StackGen Infrastructure as Code** - Design, manage, and deploy cloud infrastructure with StackGen - create appstacks, manage resources across AWS/Azure/GCP, configure environments, and push IaC to Git.

**MCP Servers:** stackgen (SSE)

---

### strands
**Build an agent with Strands SDK** - Build AI agents with Strands SDK using Bedrock, Anthropic, OpenAI, Gemini, or Llama models.

**MCP Servers:** strands-agents

---

### stripe
**Stripe Payments** - Build payment integrations with Stripe - accept payments, manage subscriptions, handle billing, and process refunds.

**MCP Servers:** stripe

---

### terraform
**Deploy infrastructure with Terraform** - Build and manage Infrastructure as Code with Terraform - access registry providers, modules, policies, and HCP Terraform workflow management.

**MCP Servers:** terraform (Docker stdio)

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidance on proposing new powers, submitting fixes, and the review process.

## License

Unless otherwise specified by the license in the individual power or the repository that hosts it, Kiro users have a non-exclusive license to access, download, and otherwise use the power for their personal or business purposes.

## Security

See [CONTRIBUTING](CONTRIBUTING.md#security-issue-notifications) for more information.
