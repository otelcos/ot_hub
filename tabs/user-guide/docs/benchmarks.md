---
id: benchmarks
title: Benchmarks
sidebar_label: Benchmarks
sidebar_position: 4
---

# Benchmarks

Open Telco provides a suite of benchmarks testing different AI capabilities in telecommunications.

## Quick Reference

| Benchmark | Category | Best For |
|-----------|----------|----------|
| TeleQnA | Knowledge | First evaluation, baseline testing |
| TeleMath | Math Reasoning | Mathematical/analytical tasks |
| TeleLogs | Operations | Network diagnostics use cases |
| 3GPP TSG | Standards | Standards document work |
| TeleYAML | Configuration | Network automation (coming soon) |
| TeleTables | Knowledge | Table interpretation from 3GPP specs |

## Running Benchmarks

### Basic Usage

```bash
uv run inspect eval src/evals/<benchmark>/<benchmark>.py --model <model>
```

### Examples

```bash
# TeleQnA - Knowledge evaluation
uv run inspect eval src/evals/teleqna/teleqna.py --model openai/gpt-4o

# TeleMath - Mathematical reasoning
uv run inspect eval src/evals/telemath/telemath.py --model openai/gpt-4o

# TeleLogs - Root cause analysis
uv run inspect eval src/evals/telelogs/telelogs.py --model openai/gpt-4o

# 3GPP TSG - Standards classification
uv run inspect eval src/evals/three_gpp/three_gpp.py --model openai/gpt-4o

# TeleTables - Table interpretation
uv run inspect eval src/evals/teletables/teletables.py --model openai/gpt-4o
```

### Common Options

| Option | Description | Example |
|--------|-------------|---------|
| `--limit N` | Run only N samples | `--limit 50` |
| `--epochs N` | Run N times for consistency | `--epochs 3` |
| `--log-dir` | Custom log directory | `--log-dir logs/my-run` |

## Benchmark Details

### TeleQnA

**What it tests:** General telecommunications knowledge from standards and research

**Question types:**
- Multiple choice questions
- True/false questions
- Fill-in-the-blank questions

**Topics covered:**
- 3GPP specifications
- Network protocols
- Wireless technologies
- Telecom standards

**Recommended starting point** for new users.

---

### TeleTables

**What it tests:** Table interpretation from 3GPP technical specifications

**Question types:**
- Multiple choice questions requiring table comprehension
- Knowledge recall about table contents

**Topics covered:**
- Signal Processing (channel coding, modulation parameters)
- Channel Configurations (bandwidth, subcarrier spacing)
- Power Parameters (transmission power, reference signals)
- Modulation Schemes (QPSK, QAM configurations)

**Note:** Smaller models (&lt;10B parameters) struggle significantly; larger models perform better.

---

### TeleMath

**What it tests:** Mathematical reasoning in telecom contexts

**Problem types:**
- Signal processing calculations
- Network optimization problems
- Performance analysis
- Resource allocation

**Implementation:** Uses a ReAct agent with bash and Python tools

**Note:** This is the most challenging benchmark, expect lower scores.

---

### TeleLogs

**What it tests:** Root cause analysis capabilities

**Scenario:** Given 5G network data (throughput, RSRP, SINR) and configuration parameters, identify the root cause of throughput degradation.

**Root causes:**
1. High interference
2. Poor coverage
3. Capacity issues
4. Handover problems
5. Backhaul constraints
6. Configuration errors
7. Hardware faults
8. External interference

---

### 3GPP TSG

**What it tests:** Understanding of 3GPP organizational structure

**Task:** Classify technical documents by their originating working group

**Groups:** RAN, SA, CT (Core and Terminals)

---

### TeleYAML (Coming Soon)

**What it tests:** Configuration generation capabilities

**Tasks:**
- AMF Configuration
- Network Slicing setup
- UE Provisioning

**Status:** Currently being revamped

## Interpreting Results

### Accuracy Scores

| Benchmark | Typical Range | Notes |
|-----------|---------------|-------|
| TeleQnA | 40-70% | Multiple choice, tests breadth |
| TeleTables | 30-60% | Table interpretation + knowledge recall |
| TeleLogs | 30-60% | Requires reasoning about network state |
| TeleMath | 20-50% | Complex multi-step calculations |
| 3GPP TSG | 50-80% | Document classification |

### Comparing Models

For fair comparisons:
- Use the same number of samples (`--limit`)
- Run multiple epochs (`--epochs 3`)
- Use the same benchmark version

## Next Steps

- [Quickstart](/docs/quickstart) - Run your first evaluation
- [FAQ](/docs/faq) - Common questions answered
- [Research Dashboard](/dashboards) - View model rankings
