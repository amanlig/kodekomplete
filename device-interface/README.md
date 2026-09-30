# aiNavLog Device Interface

Rust library skeleton for architecture.md section 5.4.3, implemented separately
from the React Native UI. Rust uses structs and traits instead of classes.
There are no external dependencies or OS-specific imports.

| Public type | Public operations |
| --- | --- |
| `ConnectionManager` | `new`, `connect`, `disconnect`, `status`, `set_reconnect_policy` |
| `TransportAdapter` | `discover`, `connect`, `disconnect`, `try_receive` |
| `BluetoothAdapter`, `WifiAdapter` | Placeholder implementations of `TransportAdapter`; construct with `default()` |
| `DeviceProtocolAdapter` | `supports`, `decode` |
| `ObservationNormalizer` | `new`, `normalize` |

All operational methods return `DeviceError::NotImplemented`. Constructors only
create empty placeholders. Nothing connects, decodes, normalizes, or collects data.
Public data types describe devices, connection status, received frames, decoded
readings, and normalized observations. Unknown observation times and missing
values are explicit. Quality includes stale, invalid, and unknown states.

The signatures are provisional logical contracts. Async execution, event delivery,
adapter injection, protocol framing, platform permissions, and the React Native
bridge remain future work. Transport handshakes/subscriptions may need outbound
traffic internally; there is intentionally no public boat-equipment control API.
No device model, Bluetooth variant, or WiFi application protocol is assumed.

With Rust installed, run from this directory:

```sh
cargo check
cargo fmt --check
```

No application license has been selected. The package is marked `publish = false`.

## Run the command-line demo

From this directory:

```sh
cargo run
```

The demo calls discovery and connection stubs and prints their `NotImplemented`
results. It accesses no hardware; successful process exit means the demo ran,
not that a device connected.

To build and run the WSL executable directly:

```sh
cargo build
./target/debug/ainavlog-device-interface
```

The library remains available independently of this executable.

## Tests

`tests/public_api.rs` is a separate Cargo integration-test target that imports
this library as a consumer would. Rust calls these integration tests because
they live outside the library; they exercise individual public components
without hardware, network access, or external test dependencies.

Run all tests from this directory:

```sh
cargo test
```

Run only the public API suite:

```sh
cargo test --test public_api
```

The five tests cover connection management, Bluetooth, WiFi, protocol defaults,
and normalization. They verify that the current stubs explicitly report
`NotImplemented` instead of claiming success or producing measurements. They do
not validate actual device behavior. Update these expectations as functionality
is implemented.
