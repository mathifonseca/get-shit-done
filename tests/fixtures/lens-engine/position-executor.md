# Lens Position: executor's-eye

**Lens:** executor's-eye
**Artifacts mined:** deviation log 03-02, git commits (Phase 03)

## Position

The retry path was underspecified. The PLAN.md mentioned "bounded retries" but
did not define the failure signal that triggers retry vs. abort. Execution had to
make a judgment call.

**Evidence:** deviation log 03-02: "unclear whether network timeout = retry or abort;
chose retry; may be wrong."

## Lesson

Bounded retry specs must name the failure signals, not just the bound.

## What I'd change

Add an ambiguity gate at plan-phase for retry/error paths: require explicit
failure-signal → action mapping before execution begins.
