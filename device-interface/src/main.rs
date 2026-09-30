//! Command-line demonstration of the public API stubs.

use ainavlog_device_interface::{
    BluetoothAdapter, ConnectionManager, DeviceDescriptor, DeviceResult, TransportAdapter,
    TransportKind, WifiAdapter,
};
use std::fmt::Debug;

fn report<T: Debug>(operation: &str, result: DeviceResult<T>) {
    match result {
        Ok(value) => println!("{operation}: {value:?}"),
        Err(error) => println!("{operation}: {error}"),
    }
}

fn main() {
    println!("aiNavLog Device Interface stub demo");
    println!("No hardware is accessed. NotImplemented results are expected.\n");

    let device = DeviceDescriptor {
        id: "demo-device".to_owned(),
        name: Some("Example instrument (placeholder)".to_owned()),
        transport: TransportKind::Bluetooth,
    };

    let mut bluetooth = BluetoothAdapter;
    let mut wifi = WifiAdapter;
    let mut connections = ConnectionManager::new();

    report("Discover Bluetooth devices", bluetooth.discover());
    report("Discover WiFi devices", wifi.discover());
    report(
        "Connect to placeholder device",
        connections.connect(&device),
    );
    report("Read connection status", connections.status());
    report("Disconnect", connections.disconnect());
}
