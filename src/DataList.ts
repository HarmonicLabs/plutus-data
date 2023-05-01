import { Data, isData } from "./Data";
import { assert } from "./utils/assert";


export class DataList
{
    private _list: Data[]
    get list(): Data[] { return this._list.map( dataElem => Object.freeze( dataElem ) as any ) };
    
    constructor( list: Data[] )
    {
        assert(
            list.every( isData ),
            "invalid list passed to constructor"
        );
        
        this._list = list.map( dataElem => dataElem.clone() );
    }
    
    clone(): DataList
    {
        return new DataList(
            this._list
            //.map( dataElem => dataElem.clone() )
            // the constructor clones the list
        );
    }

    toJson(): { list: any[] }
    {
        return {
            list: this._list.map( elem => elem.toJson() )
        }
    }
}