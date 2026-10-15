import { CborObj, isCborObj, CborUInt, CborNegInt, CborBytes, CborArray, CborMap, CborTag, CanBeCborString, Cbor, forceCborString } from "@harmoniclabs/cbor";
import { Data } from "./Data";
import { DataB } from "./DataB";
import { DataConstr } from "./DataConstr";
import { DataI } from "./DataI";
import { DataList } from "./DataList";
import { DataMap } from "./DataMap";

/**
 * Note [The 64-byte limit] (plutus-core `PlutusCore.Data`, the decoder
 * cardano-ledger uses for `plutus_data`): every leaf byte string, including
 * the magnitude of a bignum, is at most 64 bytes on the wire; longer values
 * must be sent as indefinite-length byte strings of chunks of at most 64
 * bytes (CDDL `bounded_bytes`).
 */
const MAX_BOUNDED_BYTES = 64;

function assertBoundedBytes( b: CborBytes, what: string ): void
{
    const chunks = b.chunks;
    if( chunks instanceof Uint8Array )
    {
        if( chunks.length > MAX_BOUNDED_BYTES )
        throw new Error(
            `invalid Data: ${what} of ${chunks.length} bytes exceeds 64 bytes; ` +
            `longer values must be indefinite-length chunks of at most 64 bytes`
        );
        return;
    }
    for( const chunk of chunks )
    {
        // nested indefinite chunks are rejected by the CBOR parser already
        const len = chunk.chunks instanceof Uint8Array ? chunk.chunks.length : chunk.bytes.length;
        if( len > MAX_BOUNDED_BYTES )
        throw new Error(
            `invalid Data: ${what} chunk of ${len} bytes exceeds 64 bytes`
        );
    }
}

/**
 * `#6.2(bytes)` / `#6.3(bytes)` bignum (works with every @harmoniclabs/cbor
 * 2.x: the parser keeps the magnitude in `bigNumEncoding`)
 */
function bigNumMagnitude( cObj: CborUInt | CborNegInt ): CborBytes | undefined
{
    const enc = ( cObj as any ).bigNumEncoding;
    return enc instanceof CborBytes ? enc : undefined;
}

function dataListFromCborObj( cObj: CborObj, what: string ): Data[]
{
    if(!( cObj instanceof CborArray ))
    throw new Error( `invalid Data: ${what} must be a list` );
    return cObj.array.map( dataFromCborObj );
}

/**
 * Plutus `Data` from a parsed CBOR object, with the rules of the
 * plutus-core decoder cardano-ledger uses (`decodeData`):
 *
 * - integers: major types 0/1, or `#6.2` / `#6.3` over a bounded byte string;
 * - bytes: definite of at most 64 bytes, or indefinite with chunks of at most
 *   64 bytes;
 * - lists and maps of any length kind;
 * - constructors: tags 121-127 (0-6), 1280-1400 (7-127) over a list, or tag 102
 *   over `[ uint64, list ]`.
 *
 * Everything else (other tags, text, floats, simple values) throws.
 */
export function dataFromCborObj( cborObj: CborObj ): Data
{
    if(!(
        isCborObj( cborObj )
    )) throw new TypeError(
        "Invalid cborObj to convert to Data"
    );

    if(
        cborObj instanceof CborUInt ||
        cborObj instanceof CborNegInt
    )
    {
        const magnitude = bigNumMagnitude( cborObj );
        if( magnitude ) assertBoundedBytes( magnitude, "bignum magnitude" );
        return new DataI( cborObj.num );
    }

    if( cborObj instanceof CborBytes )
    {
        assertBoundedBytes( cborObj, "byte string" );
        // `bytes` property concats the chunks for us
        return new DataB( cborObj.bytes );
    }

    if( cborObj instanceof CborArray )
    {
        return new DataList(
            cborObj.array.map( cObj => dataFromCborObj( cObj ) )
        );
    }

    if( cborObj instanceof CborMap )
    {
        return new DataMap(
            cborObj.map.map( entry => {
                return {
                    fst: dataFromCborObj( entry.k ),
                    snd: dataFromCborObj( entry.v )
                };
            })
        );
    }

    if( cborObj instanceof CborTag )
    {
        const tag = BigInt( cborObj.tag );
        const data = cborObj.data;

        if( BigInt( 121 ) <= tag && tag <= BigInt( 127 ) )
        {
            return new DataConstr(
                tag - BigInt( 121 ),
                dataListFromCborObj( data, "constructor fields" )
            );
        }

        if( BigInt( 1280 ) <= tag && tag <= BigInt( 1400 ) )
        {
            return new DataConstr(
                tag - BigInt( 1273 ),
                dataListFromCborObj( data, "constructor fields" )
            );
        }

        if( tag === BigInt( 102 ) )
        {
            const dataArr = data instanceof CborArray ? data.array : undefined;
            if(!(
                dataArr &&
                dataArr.length === 2 &&
                dataArr[0] instanceof CborUInt &&
                !bigNumMagnitude( dataArr[0] ) && // decodeWord64: no bignums
                dataArr[1] instanceof CborArray
            )) throw new Error("invalid fields for cbor tag 102 while constructing DataConstr; expected [ uint64, [ * plutus_data ] ]");

            return new DataConstr(
                dataArr[0].num,
                dataListFromCborObj( dataArr[1], "constructor fields" )
            );
        }

        // bignums over non-bytes reach here as tag 2 / 3
        throw new Error(
            "invalid Data: unexpected CBOR tag " + tag.toString() +
            "; expected 121-127, 1280-1400, 102, or 2/3 over bytes"
        );
    }

    // CborText and CborSimple (floats, booleans, null, undefined) are not Data
    throw new Error( "invalid CBOR major type for Data" );
}

/**
 * decodes exactly one Data item; trailing bytes are an error
 */
export function dataFromCbor( cbor: CanBeCborString ): Data
{
    const bytes = forceCborString( cbor );
    const { parsed, offset } = Cbor.parseWithOffset( bytes );
    if( offset !== bytes.length )
    throw new Error(
        `invalid Data: ${bytes.length - offset} trailing bytes after the CBOR item`
    );
    return dataFromCborObj( parsed );
}
