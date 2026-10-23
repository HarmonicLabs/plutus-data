# Changelog

## 2.1.0

Conformance with plutus-core's Data decoder, made for pragma-org's
[node-diversity-conformance](https://github.com/pragma-org/node-diversity-conformance) `cbor-decoding` scenario.
Requires `@harmoniclabs/cbor` 2.1.0.

### Changed
- `dataFromCborObj` / `dataFromCbor` follow plutus-core (573): constructor tags only 121–127, 1280–1400 and 102;
  `#6.2` / `#6.3` only as bignums over bytes; constructor fields must be a list; byte strings and bignum magnitudes
  at most 64 bytes, or chunked with every chunk at most 64; trailing bytes rejected.
- Decoded `Data` keeps its source bytes (a read-only `cborRef`, held in a `WeakMap` so equality and JSON are
  unchanged), and `dataToCbor` / `hashData` reproduce them, so the hash of a decoded datum matches the chain (584).

### Compatibility
No API change. Decoding is stricter on input plutus-core rejects. Data the chain accepts, and Data built with this
library's constructors, decode and encode as before.
