# Rust Bluetooth libraries

- **Status:** Research notes; library selection is proposed, not an architecture decision.
- **Reviewed:** 2026-09-30
- **Related strategy:** [Architecture — Communication](../architecture.md#43-communication)

## Candidates

The following open-source projects provide Rust Bluetooth APIs or implementations. Platform support reflects the linked project documentation at the review date; verify support for the selected release and test on actual target devices before adoption.

| Library | Platform support | Purpose and limitations |
| --- | --- | --- |
| [btleplug](https://github.com/deviceplug/btleplug) | iOS, Android, Windows, macOS, Linux | Cross-platform Bluetooth Low Energy (BLE) scanning, connecting, and reading/writing characteristics. Central mode only: the application connects to peripherals. No Bluetooth Classic support. |
| [bluest](https://github.com/alexmoon/bluest) | iOS, macOS, Windows, Linux | Cross-platform BLE alternative. Android support is listed as planned, limiting its fit for aiNavLog's mobile targets. |
| [bluer](https://github.com/bluez/bluer) | Linux | Official Rust interface to BlueZ. Supports BLE clients and servers, plus Bluetooth Classic RFCOMM and L2CAP communication. A candidate for a Linux onboard gateway or test peripheral. |
| [bluey](https://github.com/rib/bluey) | Windows, Android | BLE scanning and GATT connections. Other platforms, including iOS, are listed as planned. |
| [TrouBLE](https://github.com/embassy-rs/trouble) | Embedded devices with compatible Bluetooth controllers | BLE host stack written in Rust. Relevant to custom instrument-adapter or gateway firmware. |

Desktop and mobile libraries generally expose Rust APIs over the operating system's Bluetooth implementation. TrouBLE implements an embedded BLE host; it is not a replacement for the phone's Bluetooth APIs.

## Proposed evaluation for aiNavLog

1. **Evaluate btleplug first if the selected gateway supports BLE.** Prototype discovery, connection, and receipt of instrument observations on a physical iPhone and Android device before committing. Its documented Android setup includes Java/JNI integration, while iOS requires native integration and Bluetooth permission configuration. See the [platform integration notes](https://github.com/deviceplug/btleplug#buildinstallation-notes-for-specific-platforms).
2. **Consider bluer for a Linux test peripheral.** Expose simulated instrument readings over BLE to exercise the application's Device Interface. This would test the application's Bluetooth path, not establish compatibility with real NMEA hardware.
3. **Choose the gateway before finalizing the library.** BLE and Bluetooth Classic serial communication require different support. A gateway advertising Bluetooth alone does not establish compatibility. Confirm its application-facing protocol, supported platforms, and message formats.
4. **Validate React Native integration.** A Rust Bluetooth component needs a native bridge to the application. Evaluate build complexity, permissions, lifecycle behavior, and the dependency/download-size impact alongside connectivity.

## Relationship to NMEA communication

Proposed observation path:

```text
NMEA device → compatible gateway → Bluetooth transport adapter
            → gateway/NMEA message decoder → observation normalizer → local storage
```

The Bluetooth library handles connectivity. Decoding the gateway's payload and supported NMEA 0183 or NMEA 2000 messages is a separate responsibility. The gateway may translate messages, so its payload must be verified rather than assumed to contain raw NMEA data. This research does not establish compatibility with any particular Heart Interface model or add boat-equipment control commands to the initial read-only integration.

Before adoption, test real gateway interoperability, invalid and stale readings, disconnect/reconnect behavior, offline operation, and phone background/lock behavior. Library version, gateway hardware, supported messages, and platform support remain open decisions.

## Installed dependencies and licenses

The [library license inventory](library-licenses.md) records the installed btleplug
version and its licensing requirements, along with the other project dependencies.
