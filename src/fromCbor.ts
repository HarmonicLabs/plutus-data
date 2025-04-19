import { CborObj, isCborObj, CborUInt, CborNegInt, CborBytes, CborArray, CborMap, CborTag, CanBeCborString, Cbor, forceCborString } from "@harmoniclabs/cbor";
import { Data } from "./Data";
import { DataB } from "./DataB";
import { DataConstr, cborTagToConstrNumber } from "./DataConstr";
import { DataI } from "./DataI";
import { DataList } from "./DataList";
import { DataMap } from "./DataMap";
import { DataPair } from "./DataPair";
import { assert } from "./utils/assert";


export function dataFromCborObj( cborObj: CborObj ): Data
{
    assert(
        isCborObj( cborObj ),
        "Invalid cborObj to convert to Data"
    );

    if(
        cborObj instanceof CborUInt ||
        cborObj instanceof CborNegInt
    )
    {
        return new DataI( cborObj.num );
    }

    if( cborObj instanceof CborBytes )
    {
        // if indefinite length (> 64)
        // `bytes` property already concats the chunks for us 
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
                return new DataPair(
                    dataFromCborObj( entry.k ),
                    dataFromCborObj( entry.v )
                );
            })
        );
    }

    if( cborObj instanceof CborTag )
    {
        let tag = cborTagToConstrNumber( cborObj.tag );
        let data = cborObj.data;

        if(
            // any unrecognized tag
            tag < BigInt( 0 )
            || !(data instanceof CborArray)
        )
        {
            // ignore the tag and and treats the object as if it were normal CBOR
            return dataFromCborObj( data )
        }

        if(
            tag === BigInt( 102 )
            // DO NOT REMOVE
            // THIS IS A FIX TO A EDGE CASE
            // `cborTagToConstrNumber` will return 102 for cbor tag 1375 ( which is a DataConstr tag 102 )
            && cborObj.tag !== BigInt( 1375 )
        )
        {
            const dataArr = data.array;
            if(!(
                dataArr.length === 2 &&
                dataArr[0] instanceof CborUInt &&
                dataArr[1] instanceof CborArray
            )) throw new Error("invalid fileds for cbor tag 102 while constructing DataConstr");

            return new DataConstr(
                dataArr[0].num,
                dataArr[1].array.map( dataFromCborObj )
            );
        }

        return new DataConstr(
            tag,
            data.array.map( dataFromCborObj )
        );
    }

    // CborText and CborSimple not supported
    throw new Error( "invalid CBOR major type for Data" );
}

export function dataFromCbor( cbor: CanBeCborString ): Data
{
    return dataFromCborObj( Cbor.parse( forceCborString( cbor ) ) );
}