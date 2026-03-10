import { Data, isData } from "./Data";


export class DataList
{
    readonly list: Data[]
    
    constructor( list: Data[] )
    {
        if(!(
            Array.isArray( list ) &&
            list.every( isData )
        )) throw new TypeError(
            "invalid list passed to constructor"
        );
        
        this.list = list;
    }
    
    clone(): DataList
    {
        return new DataList(
            this.list.map( dataElem => dataElem.clone() )
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