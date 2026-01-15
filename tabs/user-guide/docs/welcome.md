---
id: welcome
title: Open Telco
sidebar_label: Welcome
sidebar_position: 1
slug: /
---

import QuickStartSteps from '@site/tabs/user-guide/components/QuickStartSteps';

# Open Telco

A suite of telco-specific benchmarks for evaluating AI models on telecommunications tasks.

<div className="welcome-hero">
  <p className="welcome-tagline">
    Built on <a href="https://inspect.aisi.org.uk/">Inspect AI</a>, Open Telco provides standardized evaluations for knowledge, reasoning, and operational capabilities in the telecom domain.
  </p>
</div>

## Quick Start

Get running in under 5 minutes:

<QuickStartSteps steps={[
  {
    title: "Clone the repository",
    description: "Get the Open Telco codebase from GitHub.",
    code: "git clone https://github.com/otelcos/evals.git\ncd evals"
  },
  {
    title: "Install dependencies",
    description: "Use uv for fast, reliable package management.",
    code: "pip install uv\nuv sync"
  },
  {
    title: "Configure your environment",
    description: "Add your API keys to a .env file.",
    code: "# Create .env with:\nHF_TOKEN=your_huggingface_token\nOPENAI_API_KEY=your_openai_key"
  },
  {
    title: "Run your first evaluation",
    description: "Test with TeleQnA benchmark.",
    code: "uv run inspect eval src/evals/teleqna/teleqna.py --model openai/gpt-4o --limit 20"
  }
]} />

For detailed setup instructions, see the [Installation Guide](/docs/installation).

## Next Steps

| Guide | Description |
|-------|-------------|
| [Installation](/docs/installation) | Detailed setup with prerequisites and troubleshooting |
| [Quickstart](/docs/quickstart) | Run your first evaluation step-by-step |
| [Benchmarks](/docs/benchmarks) | Explore all available evaluations |
| [FAQ](/docs/faq) | Common questions answered |
| [Contributing](/docs/contributing) | How to contribute to Open Telco |

## Resources

- **Repository:** [github.com/otelcos/evals](https://github.com/otelcos/evals)
- **Datasets:** [huggingface.co/datasets/GSMA/open_telco](https://huggingface.co/datasets/GSMA/open_telco)
- **Inspect AI:** [inspect.aisi.org.uk](https://inspect.aisi.org.uk/)
