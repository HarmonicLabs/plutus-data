import { toHex } from "@harmoniclabs/uint8array-utils";
import { DataB } from "./DataB";
import { DataConstr } from "./DataConstr";
import { DataI } from "./DataI";
import { DataList } from "./DataList";
import { DataMap } from "./DataMap";
import { DataPair } from "./DataPair";

export type Data 
    = DataConstr
//    | DataPair<Data,Data>
    | DataMap<any, any> // <Data, Data> but without circular def
    | DataList
    | DataI
    | DataB;

function isSomething( something: any ): boolean
{
    return something !== null && something !== undefined;
}

export function isData( something: any ): something is Data
{
    if( !isSomething( something ) ) return false;

    return (
        something instanceof DataConstr ||
        something instanceof DataMap    ||
        something instanceof DataList   ||
        something instanceof DataI      ||
        something instanceof DataB
    );
}

export function eqData( a: Data, b: Data ): boolean
{
    if(!(
        isSomething( a ) &&
        isSomething( b )
    )) return false;
    
    if( a instanceof DataConstr )
    {
        if(!(
            b instanceof DataConstr
        )) return false;
        return (
            a.constr === b.constr &&
            a.fields.length === b.fields.length &&
            a.fields.every(
                (aField, idx) => eqData( aField, b.fields[ idx ] ) 
            )
        );
    }
    if( a instanceof DataMap )
    {
        if(!(b instanceof DataMap)) return false;
        type D = DataMap<Data,Data>;
        const aMap = (a as D).map; 
        const bMap = (b as D).map; 
        return (
            aMap.length === bMap.length &&
            aMap.every(
                (entry, idx) => {
                    const bEntry = bMap[ idx ];
                    return (
                        eqData( entry.fst, bEntry.fst ) &&
                        eqData( entry.snd, bEntry.snd )
                    );
                }
            )
        );
    }
    if( a instanceof DataList )
    {
        if(!(b instanceof DataList)) return false;
        return (
            a.list.every(
                ( elem, idx ) => eqData( elem, b.list[ idx ] )
            ) 
        );
    }
    if( a instanceof DataI )
    {
        if(!( b instanceof DataI )) return false;
        return (
            a.int === b.int
        );
    }
    if( a instanceof DataB )
    {
        if(!( b instanceof DataB )) return false;
        return (
            toHex( a.bytes ) === toHex( b.bytes )
        );
    }

    return false;
}

export function cloneData<D extends Data>( data: D ): D
{
    if( !isData( data ) ) throw new Error("invalid data while cloning");

    return data.clone() as any;
}

/**
 * all data instances (from any version) will have a `toJson` method
 * this function will get back the data of this version if needed
**/
export function dataFromJson( json: { [x: string]: any } ): Data
{
    if( typeof json !== "object" ) throw new TypeError("unexpected input");
    
    const keys = Object.keys( json );

    if( keys.length <= 0 ) throw new TypeError("unexpected input");

    const k = keys[0];
    
    if( k === "int" ) return new DataI( json[k] );
    if( k === "bytes" ) return new DataB( json[k] );
    if( k === "list" ) return new DataList( json[k].map( dataFromJson ) );
    if( k === "map" )
    {
        const jsonMap = json[k] as ({ k: any, v: any })[];
        return new DataMap(
            jsonMap.map(({ k, v }) => new DataPair( dataFromJson( k ), dataFromJson( v ) ))
        );
    }
    if( keys.includes("constr") ) return new DataConstr( json.constr, json.fields.map( dataFromJson ) );

    throw new Error("unknown json format");
}