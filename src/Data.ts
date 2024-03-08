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
    const proto = Object.getPrototypeOf( something );

    return (
        proto === DataConstr.prototype ||
        proto === DataMap.prototype    ||
        proto === DataList.prototype   ||
        proto === DataI.prototype      ||
        proto === DataB.prototype
    );
}

export function eqData( a: Data, b: Data ): boolean
{
    if(!(
        isSomething( a ) &&
        isSomething( b )
    )) return false;
    
    const aProto = Object.getPrototypeOf( a );
    const bProto = Object.getPrototypeOf( b );

    if( aProto !== bProto ) return false;

    if( aProto === DataConstr.prototype )
    {
        try {
            return (
                (a as DataConstr).constr === (b as DataConstr).constr &&
                (a as DataConstr).fields.length === (b as DataConstr).fields.length &&
                (a as DataConstr).fields.every(
                    (aField, idx) => eqData( aField, (b as DataConstr).fields[ idx ] ) 
                )
            );
        } catch (e) {
            return false;
        }
    }
    if( aProto === DataMap.prototype )
    {
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
    if( aProto === DataList.prototype )
    {
        return (
            (a as DataList).list.every(
                ( elem, idx ) => eqData( elem, (b as DataList).list[ idx ] )
            ) 
        );
    }
    if( aProto === DataI.prototype )
    {
        return (
            (a as DataI).int === (b as DataI).int
        );
    }
    if( aProto === DataB.prototype )
    {
        return (
            (a as DataB).bytes.toString() === (b as DataB).bytes.toString()
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