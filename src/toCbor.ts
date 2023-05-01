import { Data, isData } from "./Data";
import { DataConstr, constrNumberToCborTag } from "./DataConstr";
import { DataMap } from "./DataMap";
import { DataList } from "./DataList";
import { DataI } from "./DataI";
import { DataB } from "./DataB";
import { CborObj, CborArray, CborUInt, CborTag, CborMap, CborNegInt, CborBytes, CborString, Cbor } from "@harmoniclabs/cbor";
import { assert } from "./utils/assert";


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
        return new CborBytes(
            data.bytes.toBuffer()
        );
    }

    throw new Error(
        "'dataToCborObj' did not match any possible Data constructor"
    );
}

export function dataToCbor( data: Data ): CborString
{
    return Cbor.encode( dataToCborObj( data ) );
}