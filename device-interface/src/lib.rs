//! Device Interface contracts and an async btleplug BLE evaluation adapter.

pub mod bluetooth;
pub mod connection;
pub mod normalizer;
pub mod protocol;
pub mod transport;
pub mod types;

pub use connection::ConnectionManager;
pub use normalizer::ObservationNormalizer;
pub use protocol::DeviceProtocolAdapter;
pub use transport::{BluetoothAdapter, TransportAdapter, WifiAdapter};
pub use types::*;
