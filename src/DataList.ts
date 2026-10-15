import { Data, isData } from "./Data";
import { SubCborRef } from "@harmoniclabs/cbor";
import { getDataCborRef, setDataCborRef } from "./cborRef";


export class DataList
{
    readonly list: Data[]
    
    constructor( list: Data[], cborRef?: SubCborRef )
    {
        if(!(
            Array.isArray( list ) &&
            list.every( isData )
        )) throw new TypeError(
            "invalid list passed to constructor"
        );
        
        this.list = list;
        setDataCborRef( this, cborRef );
    }

    /**
     * the bytes this value was decoded from (`dataFromCborObj`), emitted
     * verbatim by `dataToCbor`; `undefined` for constructed values
     */
    get cborRef(): SubCborRef | undefined
    {
        return getDataCborRef( this );
    }
    
    clone(): DataList
    {
        return new DataList(
            this.list.map( dataElem => dataElem.clone() ),
            this.cborRef?.clone()
        );
    }

    toJSON() { return this.toJson(); }
    toJson(): { list: any[] }
    {
        return {
            list: this.list.map( elem => elem.toJson() )
        }
    }

    toString(): string
    {
        return `List [${this.list.map( data => data.toString() ).join(",")}]`
    }
}