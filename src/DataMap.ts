import { Data, isData } from "./Data";
import { DataPair } from "./DataPair";
import { assert } from "./utils/assert";
import { roDescr } from "./utils/roDescr";


export class DataMap<DataKey extends Data, DataValue extends Data>
{
    readonly map: DataPair<DataKey, DataValue>[];

    constructor( map: DataPair<DataKey, DataValue>[] )
    {
        assert(
            Array.isArray( map ) &&
            map.every( entry =>
                entry instanceof DataPair &&
                isData( entry.fst ) && isData( entry.snd )
            ),
            "invalid map passed to 'DataPair' constructor"
        );

        Object.defineProperties(
            this, {
                map: { value: map, ...roDescr }
            }
        );
    }

    clone(): DataMap<DataKey,DataValue>
    {
        return new DataMap(
            this.map.map( pair => pair.clone() )
        );
    }

    toJson(): { map: ({ k: any, v: any })[] }
    {
        return {
            map: this.map.map( ({ fst, snd }) =>
                ({
                    k: fst.toJson(),
                    v: snd.toJson()
                })
            )
        }
    }

    toString(): string
    {
        return `Map [${this.map.map( dataPair => dataPair.toString() ).join(",")}]`
    }
}