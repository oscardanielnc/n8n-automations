# 0005 — The LLM sorts, fixed rules decide

**Status:** Accepted · 2026-11-06

## Context
Every input these flows read (emails, job postings) is written by strangers. LLM classifiers can be steered by
instructions hidden in that text, and the typed decision model used here was publicly shown to flip its verdict
under prompt injection.

## Decision
- The model only answers typed questions (`choice`, yes/no) and returns probabilities. It never writes the message
  and never takes an action.
- Untrusted text travels inside the `state` object, labelled as untrusted; the request says to ignore instructions in it.
- Code nodes apply thresholds and checks that the text cannot influence: allow-lists, DKIM/DMARC, dates.
- Discarding is asymmetric: a posting is dropped only when the model is almost sure (≥ 80 %); doubtful ones pass with a
  warning, because a person reviews whatever passes. Every discarded item stays in the report with its reason and the
  sentence of the posting that backs it.
- A new filter version is run in dry-run mode against postings with a known outcome before it is published; one
  version failed that regression and never shipped.

## Why
A wrong "you won" or a silently dropped job offer costs more than a few extra items to read.
