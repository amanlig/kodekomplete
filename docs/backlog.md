# Exploration backlog

Deferred ideas and investigations to revisit as aiNavLog develops. These entries are not committed delivery plans. Explicit scope decisions are noted per entry.

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

## Wi-Fi instrument connectivity

- **Status:** Shelved; excluded from beta (confirmed scope decision).
- **Added:** 2026-10-01
- **Revisit when:** After beta, if supported instrument/gateway requirements justify
  an additional transport.

Beta device connectivity is Bluetooth-only. NMEA 0183 and NMEA 2000 encoding and
decoding remain in scope independently of transport. The unimplemented
`WifiAdapter` and `TransportKind::Wifi` were removed from the active Rust API,
tests and class diagrams; no working Wi-Fi integration was removed.

If revisited, evaluate compatible gateways, TCP/UDP transport, discovery,
permissions, reconnect behavior, and iOS/Android support. Define transport framing
and buffering before adding a concrete adapter to the shared transport interfaces.

**Expected outcome:** A separately scoped post-beta proposal backed by gateway
requirements and platform validation. No beta Wi-Fi implementation is planned.
