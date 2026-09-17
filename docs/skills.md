# Skills Guide

This guide explains how to choose and combine XppAI skills in real AX 2009 work.

## Main Entry Skills

### `xppai-papai` (Main)

Use when the artifact is mixed, ambiguous, or high-value and you want senior-style judgment.

`xppai-papai` reasons about what matters most, selects the right specialist skills, and synthesizes a practical conclusion.

Best for:

- mixed artifacts (for example posting code with performance concerns)
- unclear root cause
- code reviews where prioritization matters
- "what should we do next?" conversations

### `xppai-babysit` (Main)

Use when you want predictable, structured output with a fixed sequence per artifact type.

`xppai-babysit` classifies the artifact and applies a predefined skill flow.

Best for:

- repeatable team workflow
- consistent labeled output format
- known artifact types where deterministic routing is preferred

## Specialist Skills

### `xppai-init`

Shared foundation and guardrails for all XppAI analysis.

### `xppai-explain`

Understand unfamiliar methods, classes, forms, or tables before changing anything.

### `xppai-stack`

Analyze profiler traces and stack traces for performance bottlenecks.

### `xppai-risk`

Assess change risk before implementing modifications.

### `xppai-support`

Troubleshoot AX 2009 support symptoms that start as business errors rather than code artifacts.

### `xppai-codefix`

Generate minimal, production-oriented fixes after root cause and risk are understood.

### `xppai-posting`

Analyze FormLetter and posting-related behavior, sequencing, and side effects.

### `xppai-architect`

Review for structural issues, coupling, responsibility drift, and long-term maintenance risk.

### `xppai-exportxpo`

Generate a ready-to-paste X++ export job for specific AOT objects.

### `xppai-help`

Quick reference for available skills and usage guidance.

## How to Choose Quickly

- Start with `xppai-papai` when in doubt.
- Use `xppai-babysit` when consistency and speed of routine analysis are more important than dynamic triage.
- Use specialists directly only when your problem is already scoped.

## Common Flows

## XPO Intake Behavior

When an XPO file or pasted XPO text is provided, XppAI uses direct intake once before analysis. Orchestrator skills such as `xppai-papai` and `xppai-babysit` pass `XPO intake already completed for this request` to selected specialist skills so they do not repeat intake. For local-file input, skills read the `.xpo` content directly. For pasted input, skills analyze directly from pasted content. If local file access fails, request corrected path or pasted content.

### Unknown Artifact

1. `xppai-papai`  
2. `xppai-risk` (if changes are being considered)  
3. `xppai-codefix` (only after risk/context is clear)

### Profiler or Stack Trace

1. `xppai-stack`  
2. `xppai-risk`  
3. `xppai-codefix`

### Posting Investigation

1. `xppai-posting`  
2. `xppai-explain`  
3. `xppai-risk`

### Symptom-First Support Issue

1. `xppai-papai`
2. `xppai-support`
3. `xppai-posting` or `xppai-explain` (if technical evidence is provided)
4. `xppai-risk` / `xppai-codefix` (only if change work begins)

### Pre-change Review

1. `xppai-risk`  
2. `xppai-architect` (if structural concerns exist)  
3. `xppai-codefix`
