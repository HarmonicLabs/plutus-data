import { Data, isData } from "./Data";
import { assert } from "./utils/assert";
import { roDescr } from "./utils/roDescr";


export class DataList
{
    readonly list: Data[]
    
    constructor( list: Data[] )
    {
        assert(
            Array.isArray( list ) &&
            list.every( isData ),
            "invalid list passed to constructor"
        );
        
        Object.defineProperties(
            this, {
                list: { value: list, ...roDescr }
            }
        );
    }
    
    clone(): DataList
    {
        return new DataList(
            this.list.map( dataElem => dataElem.clone() )
        );
    }

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