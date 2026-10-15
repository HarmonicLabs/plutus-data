import { CborObj, CborTag, SubCborRef } from "@harmoniclabs/cbor";

/**
 * Source bytes of decoded `Data` (node-diversity-conformance item 584).
 *
 * cardano-ledger keeps the bytes a `Data` value was decoded from
 * (`MemoBytes`): datum hashes, the script data hash and re-serialised
 * transactions use them, never a re-encoding. `dataFromCborObj` therefore
 * attaches a `SubCborRef` to every value it builds, and `dataToCbor` /
 * `dataToCborObj` emit those bytes when present. Values built with the
 * constructors carry no reference (unless one is passed explicitly) and are
 * encoded as before.
 *
 * The reference lives in a WeakMap rather than on the instance so that
 * structural comparisons (`toEqual`, `eqData`, JSON) are unaffected.
 * Decoded `Data` must be treated as immutable: mutating `fields`, `list` or
 * `map` in place does not invalidate the reference.
 */
const refs: WeakMap<object, SubCborRef> = new WeakMap();

export function getDataCborRef( data: object ): SubCborRef | undefined
{
    return refs.get( data );
}

/** @internal used by the `Data` constructors */
export function setDataCborRef( data: object, ref: SubCborRef | undefined ): void
{
    if( ref === undefined ) return;
    const normalized = toSubCborRef( ref );
    if( normalized ) refs.set( data, normalized );
}

function isSubCborRefLike( r: any ): boolean
{
    return (
        typeof r === "object" && r !== null &&
        r._bytes instanceof Uint8Array &&
        typeof r.start === "number" &&
        typeof r.end === "number" &&
        0 <= r.start && r.start < r.end && r.end <= r._bytes.length
    );
}

/** accepts a `SubCborRef` from any @harmoniclabs/cbor copy */
export function toSubCborRef( r: any ): SubCborRef | undefined
{
    if( !isSubCborRefLike( r ) ) return undefined;
    if( r instanceof SubCborRef ) return r;
    return new SubCborRef({ _bytes: r._bytes, start: r.start, end: r.end });
}

/** length of a CBOR head from its additional-info bits, 0 if invalid */
function headLength( initialByte: number ): number
{
    const ai = initialByte & 0x1f;
    if( ai < 24 ) return 1;
    if( ai === 24 ) return 2;
    if( ai === 25 ) return 3;
    if( ai === 26 ) return 5;
    if( ai === 27 ) return 9;
    return 0;
}

/**
 * the bytes of a parsed CBOR object; for a tag parsed by a cbor build that
 * does not keep tag refs, derived from the payload's ref (the tag head
 * sits right before the payload)
 */
export function cborObjSubRef( cObj: CborObj ): SubCborRef | undefined
{
    const own = toSubCborRef( ( cObj as any ).subCborRef );
    if( own ) return own;
    if(!( cObj instanceof CborTag )) return undefined;

    const inner = cborObjSubRef( cObj.data );
    if( !inner ) return undefined;
    const bytes = inner._bytes;
    const tag = BigInt( cObj.tag );
    for( const len of [ 1, 2, 3, 5, 9 ] )
    {
        const start = inner.start - len;
        if( start < 0 ) break;
        const b0 = bytes[ start ];
        if( ( b0 >> 5 ) !== 6 || headLength( b0 ) !== len ) continue;
        let value = BigInt( len === 1 ? b0 & 0x1f : 0 );
        for( let i = 1; i < len; i++ ) value = ( value << BigInt( 8 ) ) | BigInt( bytes[ start + i ] );
        if( value === tag ) return new SubCborRef({ _bytes: bytes, start, end: inner.end });
    }
    return undefined;
}
