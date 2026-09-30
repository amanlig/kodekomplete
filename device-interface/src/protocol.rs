use crate::types::*;

/// Implement for each supported instrument protocol once its format is known.
/// No Heart Interface protocol is assumed or implemented.
pub trait DeviceProtocolAdapter {
    fn supports(&self, _device: &DeviceDescriptor) -> DeviceResult<bool> {
        Err(DeviceError::NotImplemented)
    }

    /// A frame may eventually yield zero, one, or multiple readings.
    fn decode(&mut self, _frame: &ReceivedFrame) -> DeviceResult<Vec<DecodedReading>> {
        Err(DeviceError::NotImplemented)
    }
}
