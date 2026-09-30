# Exploration backlog

Deferred ideas and investigations to revisit as aiNavLog develops. These entries are not committed architecture decisions.

## Explore iPhone development and testing workflow

- **Status:** Deferred
- **Added:** 2026-09-30
- **Revisit when:** Preparing the first React Native iPhone prototype.

Evaluate VS Code with Expo EAS cloud builds from the current Windows/WSL environment versus local iOS builds and debugging on a Mac with Xcode. VS Code can remain the primary editor in either workflow.

Compare:

- Physical iPhone installation, signing, and daily testing workflow.
- Native Rust integration and rebuild requirements.
- NMEA 0183 and NMEA 2000 gateway connectivity, starting with simulated instrument observations and progressing to real onboard devices.
- Debugging, offline operation, interrupted connections, and app background behavior.
- Hardware, Apple Developer membership, and cloud-build costs.

**Expected outcome:** Select and document a development setup and a repeatable iPhone testing workflow before implementing the prototype's native integrations.
