//! OS-independent Device Interface contracts for architecture section 5.4.3.
//! Operational methods are stubs and return `DeviceError::NotImplemented`.
//! No React Native, hardware SDK, or platform implementation is included.

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
