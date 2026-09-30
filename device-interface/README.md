# aiNavLog Device Interface

Rust Device Interface library and BLE evaluation CLI for architecture section 5.4.3.
See the [UML class diagram](../docs/device-interface-class-diagram.md) for current
components, relationships, and data contracts.

Bluetooth uses [btleplug](https://github.com/deviceplug/btleplug) with Tokio.
This is Bluetooth Low Energy (BLE) central support, not Bluetooth Classic serial.

## Discover and connect

From this directory:

```sh
cargo run -- discover
cargo run -- discover 10
cargo run -- connect '<device-id>'
```

Discovery scans for five seconds by default and prints opaque device IDs and
names. Copy an exact ID into `connect`; quote it to preserve special characters.
Unnamed devices are included. Results can include OS-cached devices and do not
guarantee that a device is currently reachable or connectable.

```sh
cargo run -- discover 10 0
cargo run -- connect '<device-id>' 10 0
cargo run -- --help
```

Optional arguments are scan duration (1–300 seconds) and zero-based local adapter
index (default 0). Connection performs a fresh scan, connects only to the selected
ID, and holds the connection until Ctrl-C, then explicitly disconnects. On Windows,
if the ID is absent from the scan, it attempts the explicitly supplied Bluetooth
address directly; an advertisement is not required to start that attempt. Device
IDs are matched without case sensitivity. Connection
and disconnection operations have 20-second timeouts. Failures exit nonzero;
no arguments display help without accessing hardware. An existing connection not
owned by this adapter is rejected. A failed connection attempts cleanup.

No characteristics are written, no NMEA data is decoded, and no equipment control
commands are sent. Pairing flows, automatic reconnect, notification subscriptions,
and monitoring unexpected remote disconnections are not implemented yet.

## Platform setup

- **Linux:** Requires an accessible Bluetooth controller, BlueZ and the system
  D-Bus service. The Linux dependency enables vendored libdbus, so building needs
  a C compiler but not system D-Bus development headers or `pkg-config`.
- **WSL:** A working Rust build does not establish Bluetooth access. The Linux
  environment must expose a controller and run the required services. If it does
  not, run the CLI natively on Windows with Windows Rust tooling and Bluetooth enabled.
- **macOS:** Grant Bluetooth permission to the terminal/application; packaged
  applications need the Bluetooth usage description described by btleplug.
- **iOS/Android:** Native application packaging, permissions, and a React Native
  bridge are still required. This CLI does not implement the mobile bridge.

See [btleplug's platform setup](https://github.com/deviceplug/btleplug#buildinstallation-notes-for-specific-platforms)
and the [library evaluation notes](../docs/rust-bluetooth-libraries.md).

## Library API and remaining stubs

`BluetoothAdapter::default()` creates an inert adapter without accessing hardware.
Use its async methods inside a Tokio runtime:

- `BluetoothAdapter::new(index).await`: select an OS adapter.
- `discover(Duration).await`: scan and return device descriptors; lazy initialization
  uses adapter 0 when constructed with `default()`.
- `connect(&descriptor).await`: connect to a previously discovered device.
- `connect_by_id(id).await`: resolve a discovered ID or, on Windows, register and
  attempt the explicitly supplied Bluetooth address even if it was not in the scan.
- `disconnect().await`: release the owned connection; callers should invoke this
  even after a failed connection to clean up a possible partial connection.

The Bluetooth adapter has async inherent methods and does not implement the
provisional synchronous `TransportAdapter` trait. That trait and `WifiAdapter`,
`ConnectionManager`, `DeviceProtocolAdapter`, and `ObservationNormalizer` remain
stubs returning `DeviceError::NotImplemented`. The CLI calls Bluetooth directly.
The unified transport/connection-manager contract remains future integration work.

Discovery should be allowed to finish so it can stop the OS scan. Dropping/cancelling
its future is not a substitute for cleanup. Likewise, callers own disconnection;
there is no async cleanup on drop.

## Validation

```sh
cargo fmt --check
cargo test
cargo clippy --all-targets -- -D warnings
```

Tests validate CLI arguments, Bluetooth request rejection without hardware, and
remaining stub contracts. Real discovery and connection require a BLE peripheral;
these tests do not claim radio interoperability or NMEA gateway compatibility.

No application license has been selected. The package is marked `publish = false`.

## Windows executable

The Windows x64 release executable is built at:

```text
target/x86_64-pc-windows-msvc/release/ainavlog-device-interface.exe
```

Run from Windows PowerShell in this directory:

```powershell
.\target\x86_64-pc-windows-msvc\release\ainavlog-device-interface.exe discover 10
.\target\x86_64-pc-windows-msvc\release\ainavlog-device-interface.exe connect '<device-id>'
```

This uses Windows Bluetooth directly, even when the executable is stored in a
WSL project directory. Bluetooth must be enabled in Windows.

To rebuild natively, install Rust for Windows with the MSVC toolchain and Visual
Studio C++ Build Tools/Windows SDK, then run `./build-windows.ps1` in PowerShell.
The script uses the committed Cargo lockfile. Release binaries are generated
artifacts under `target`, not committed source files.

Cross-building from Linux is also supported using
[cargo-xwin](https://github.com/rust-cross/cargo-xwin), the Windows Rust target,
and LLVM's `lld-link` (Rust's bundled `rust-lld` can provide that linker):

```sh
rustup target add x86_64-pc-windows-msvc
cargo xwin build --release --locked --target x86_64-pc-windows-msvc
```

The cross-build downloads Microsoft SDK/CRT link libraries on first use. Native
C/C++ dependencies, if added later, may additionally require clang tooling.

### Device appears in discovery but will not connect

Try the Windows executable with the exact device address:

```powershell
.\target\x86_64-pc-windows-msvc\release\ainavlog-device-interface.exe connect 'D4:B3:CB:26:5E:75' 10
```

The CLI now prints when it is attempting an address that was not seen in the
current scan. The result distinguishes a missing scan result from a connection
failure returned by Windows. This fallback cannot make an offline or
non-connectable advertiser accept a BLE connection. Confirm the device model,
BLE/GATT support, required pairing/connection mode, and whether another app or
phone is using its connection. Some devices change advertising addresses; verify
identity with the device's documentation rather than guessing from similar IDs.

## Third-party licenses

See the [library license inventory](../docs/library-licenses.md) for direct and
transitive dependencies, browser libraries, and redistribution requirements.

The beta deployment targets are **iOS and Android**. Windows/Linux CLI builds are
evaluation tools. See the [mobile beta license assessment](../docs/library-licenses.md#mobile-beta-distribution-policy)
for target-specific dependency coverage and the remaining mobile packaging review.
