import { Data, isData } from "./Data";
import { DataConstr, constrNumberToCborTag } from "./DataConstr";
import { DataMap } from "./DataMap";
import { DataList } from "./DataList";
import { DataI } from "./DataI";
import { DataB } from "./DataB";
import { CborObj, CborArray, CborUInt, CborTag, CborMap, CborNegInt, CborBytes, CborString, Cbor } from "@harmoniclabs/cbor";
import { assert } from "./utils/assert";
import { fromHex } from "@harmoniclabs/uint8array-utils";

const minBigInt = BigInt("-18446744073709551616"); // -(2n ** 64n)
const maxBigInt = BigInt("18446744073709551615");  // (2n ** 64n) - 1n

export function dataToCborObj( data: Data ): CborObj 
{
    assert(
        isData( data ),
        "Invalid data; cannot convert to CBOR"
    );

    if( data instanceof DataConstr )
    {
        const constrNum = data.constr;

        const tag = constrNumberToCborTag( constrNum );

        let fields = new CborArray(
            data.fields.map( dataToCborObj ),
            {
                indefinite: data.fields.length > 0
            }
        );

        if( Number( tag ) === 102 )
        {
            /*
            Any alternatives, including those that don't fit in the above
            
            -> tag 102 followed by a list containing
                an unsigned integer for the actual alternative, 
                and then the arguments in a (nested!) list.
            */
            fields = new CborArray([
                new CborUInt( constrNum ),
                fields
            ]);
        }

        return new CborTag(
            tag,
            fields
        )
    }
    if( data instanceof DataMap )
    {
        return new CborMap(
            data.map.map( pair => {
                return {
                    k: dataToCborObj( pair.fst ),
                    v: dataToCborObj( pair.snd )
                }
            }),
            {
                indefinite: data.map.length > 0
            }
        );
    }
    if( data instanceof DataList )
    {
        return new CborArray(
            data.list.map( dataToCborObj ),
            {
                indefinite: data.list.length > 0
            }
        );
    }
    if( data instanceof DataI )
    {
        const n = data.int;

        return (
            n < 0 ?
            new CborNegInt( n ) :
            new CborUInt( n )
        );
    }
    if( data instanceof DataB )
    {
        const bytes = data.bytes.toBuffer();
        
        // definite length only if length <= 64
        if( bytes.length <= 64 ) return new CborBytes( bytes );

        let ptr = 64;
        const fst = Uint8Array.prototype.slice.call( bytes, 0, ptr );
        const chunks: Uint8Array[] = [];
        let chunkSize = 0;
        let chunkEnd = 0;
        while( ptr < bytes.length )
        {
            chunkSize = Math.min( 64, bytes.length - ptr );
            chunkEnd = ptr + chunkSize;
            chunks.push(
                Uint8Array.prototype.slice.call(
                    bytes, ptr, chunkEnd
                )
            );
            ptr = chunkEnd;
        }

        // indefinite length bytes
        return Array.isArray( chunks ) && chunks.length > 0 ?
            new CborBytes( [ fst, ...chunks ].map( chunk => new CborBytes( chunk ) ) ) :
            new CborBytes( fst );
    }

    throw new Error(
        "'dataToCborObj' did not match any possible Data constructor"
    );
}

export function dataToCbor( data: Data ): CborString
{
    return Cbor.encode( dataToCborObj( data ) );
}

function positiveIntegerToBytes( n: bigint ): Uint8Array
{
    const hex = n.toString(16);
    return fromHex( (hex.length % 2) === 0 ? hex : "0" + hex ); 
}