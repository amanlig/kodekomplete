# Device Interface UML class diagram

This diagram describes the Rust code in `device-interface/src`, reviewed on
2026-09-30. Rust structs are shown as classes and traits as interfaces. It reflects
the current implementation rather than the proposed architecture.

## Components and dependencies

```mermaid
classDiagram
    direction LR

    class BluetoothAdapter {
        <<struct>>
        -Option~Adapter~ adapter
        -BTreeMap discovered
        -Option~Peripheral~ connected
        +new(index: usize) DeviceResult~Self~
        +discover(duration: Duration) DeviceResult
        +connect_by_id(id: str) DeviceResult
        +connect(device: DeviceDescriptor) DeviceResult
        +disconnect() DeviceResult
        -register_known_address(id: str) DeviceResult~String~
    }
    class TransportAdapter {
        <<interface>>
        +discover() DeviceResult
        +connect(device: DeviceDescriptor) DeviceResult
        +disconnect() DeviceResult
        +try_receive() DeviceResult
    }
    class WifiAdapter {
        <<struct>>
    }
    class ConnectionManager {
        <<struct>>
        +new() Self
        +connect(device: DeviceDescriptor) DeviceResult
        +disconnect() DeviceResult
        +status() DeviceResult~ConnectionStatus~
        +set_reconnect_policy(policy: ReconnectPolicy) DeviceResult
    }
    class DeviceProtocolAdapter {
        <<interface>>
        +supports(device: DeviceDescriptor) DeviceResult~bool~
        +decode(frame: ReceivedFrame) DeviceResult
    }
    class ObservationNormalizer {
        <<struct>>
        +new() Self
        +normalize(reading: DecodedReading) DeviceResult~Observation~
    }
    class BtleplugAdapter {
        <<external>>
    }
    class BtleplugPeripheral {
        <<external>>
    }
    class CLI {
        <<binary>>
    }

    TransportAdapter <|.. WifiAdapter : implements
    BluetoothAdapter --> "0..1" BtleplugAdapter : adapter handle
    BluetoothAdapter --> "0..*" BtleplugPeripheral : discovered handles by ID
    BluetoothAdapter --> "0..1" BtleplugPeripheral : selected connection handle
    CLI ..> BluetoothAdapter : awaits methods directly
    BluetoothAdapter ..> DeviceDescriptor : accepts and returns
    TransportAdapter ..> DeviceDescriptor : accepts and returns
    TransportAdapter ..> ReceivedFrame : returns optional frame
    ConnectionManager ..> DeviceDescriptor : accepts
    ConnectionManager ..> ConnectionStatus : returns
    ConnectionManager ..> ReconnectPolicy : accepts
    DeviceProtocolAdapter ..> DeviceDescriptor : checks support
    DeviceProtocolAdapter ..> ReceivedFrame : accepts
    DeviceProtocolAdapter ..> DecodedReading : returns list
    ObservationNormalizer ..> DecodedReading : accepts
    ObservationNormalizer ..> Observation : returns

    note for BluetoothAdapter "All listed methods are async. Default creates an inert instance. Does not implement TransportAdapter."
    note for ConnectionManager "Stub: no adapter wiring or connection state storage yet."
    note for TransportAdapter "Synchronous trait. Default operations return NotImplemented."
    note for DeviceProtocolAdapter "Default operations are stubs. No concrete production decoder yet."
    note for ObservationNormalizer "normalize is a stub."
```

Solid arrows represent stored handles; dotted arrows represent use through method
arguments or results. The hollow triangle denotes trait implementation. `btleplug`
handles are shared/clonable, so they are not shown as exclusively owned UML
compositions. A selected connection handle can be retained after a failed attempt
for cleanup; its presence alone does not establish a live connection.

All operations returning `DeviceResult` use the alias
`DeviceResult<T> = Result<T, DeviceError>`. To keep signatures readable, Rust
borrows and some nested generic return types are abbreviated:

| Method | Successful result |
| --- | --- |
| Both `discover` methods | `Vec<DeviceDescriptor>` |
| `TransportAdapter::try_receive` | `Option<ReceivedFrame>` |
| `DeviceProtocolAdapter::decode` | `Vec<DecodedReading>` |
| Connect, disconnect, and set-reconnect-policy operations | `()` |

`BluetoothAdapter::register_known_address` is private and platform-specific:
Windows can register an explicit Bluetooth address with btleplug; other platforms
currently return an error for an ID absent from discovery. The CLI uses
`connect_by_id` after scanning.

## Data contracts

```mermaid
classDiagram
    direction LR

    class DeviceDescriptor {
        <<struct>>
        +String id
        +Option~String~ name
        +TransportKind transport
    }
    class TransportKind {
        <<enumeration>>
        Bluetooth
        Wifi
    }
    class ConnectionStatus {
        <<struct>>
        +Option~DeviceDescriptor~ device
        +ConnectionState state
        +Option~SystemTime~ last_observation_at
        +Option~DeviceError~ error
    }
    class ConnectionState {
        <<enumeration>>
        Disconnected
        Connecting
        Connected
        Reconnecting
        Failed
    }
    class ReconnectPolicy {
        <<struct>>
        +u32 max_attempts
        +Duration retry_delay
    }
    class ReceivedFrame {
        <<struct>>
        +String source_id
        +SystemTime received_at
        +Vec~u8~ payload
    }
    class DecodedReading {
        <<struct>>
        +String source_id
        +Option~SystemTime~ observed_at
        +SystemTime received_at
        +String quantity
        +String unit
        +Option~f64~ value
        +QualityStatus quality
    }
    class Observation {
        <<struct>>
        +String source_id
        +Option~SystemTime~ observed_at
        +SystemTime received_at
        +String quantity
        +String unit
        +Option~f64~ value
        +QualityStatus quality
    }
    class QualityStatus {
        <<enumeration>>
        Good
        Stale
        Invalid
        Unknown
    }
    class DeviceError {
        <<enumeration>>
        NotImplemented
        UnsupportedProtocol
        PermissionDenied
        Disconnected
        InvalidReading
        Transport(String)
        Decode(String)
    }

    DeviceDescriptor --> TransportKind : transport
    ConnectionStatus --> "0..1" DeviceDescriptor : device
    ConnectionStatus --> ConnectionState : state
    ConnectionStatus --> "0..1" DeviceError : error
    DecodedReading --> QualityStatus : quality
    Observation --> QualityStatus : quality
```

`DecodedReading` and `Observation` are independent structs with matching fields;
neither inherits from the other. Missing timestamps and measurements remain
explicit through `Option`. Device IDs are opaque identifiers, not universally MAC
addresses.

## Source references

- [Bluetooth implementation](../device-interface/src/bluetooth.rs)
- [Transport trait and WiFi stub](../device-interface/src/transport.rs)
- [Connection manager](../device-interface/src/connection.rs)
- [Protocol trait](../device-interface/src/protocol.rs)
- [Normalizer](../device-interface/src/normalizer.rs)
- [Data contracts](../device-interface/src/types.rs)
- [CLI](../device-interface/src/main.rs)
- [Build and usage instructions](../device-interface/README.md)

The operational BLE adapter is not yet wired into the synchronous transport trait
or `ConnectionManager`. Notification reception, protocol decoding, normalization,
and the React Native bridge remain future work.
