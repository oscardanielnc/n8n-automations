# 0005 — Telegram for errors only, per-page cutover

**Status:** Accepted · 2026-11-10 (Oscar)

## Context
One Telegram message per item was too much to read every day.

## Decision
Telegram keeps only the F5 error workflow and daily health problems (the Monday "all good" summary is dropped; the Home
flow tiles replace it). Each flow stops sending results to Telegram **the day its page goes live**, so nothing is lost
in between.
