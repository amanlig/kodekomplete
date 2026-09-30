use crate::types::*;

/// Converts decoded readings into the common Data capture contract.
#[derive(Default)]
pub struct ObservationNormalizer;

impl ObservationNormalizer {
    pub fn new() -> Self {
        Self
    }

    /// Source, timestamps, units, and quality must be preserved or explicitly
    /// converted. Validation and normalization rules remain unimplemented.
    pub fn normalize(&self, _reading: &DecodedReading) -> DeviceResult<Observation> {
        Err(DeviceError::NotImplemented)
    }
}
