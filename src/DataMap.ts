import { isObject } from "@harmoniclabs/obj-utils";
import { Data, isData } from "./Data";

export interface KV<DataKey extends Data, DataValue extends Data> {
    fst: DataKey;
    snd: DataValue;
}
export class DataMap<DataKey extends Data, DataValue extends Data>
{
    readonly map: KV<DataKey, DataValue>[];

    constructor( map: KV<DataKey, DataValue>[] )
    {
        if(!(
            Array.isArray( map ) &&
            map.every( entry =>
                isObject( entry ) &&
                isData( entry.fst ) && isData( entry.snd )
            )
        )) throw new TypeError(
            "invalid map passed to 'DataPair' constructor"
        );

        this.map = map;
    }

    clone(): DataMap<DataKey,DataValue>
    {
        return new DataMap(
            this.map.map( pair => ({
                fst: pair.fst.clone() as DataKey,
                snd: pair.snd.clone() as DataValue
            }) )
        );
    }

    toJSON() { return this.toJson(); }
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
        return `Map [${this.map.map( dataPair => `(${dataPair.fst.toString()},${dataPair.fst.toString()})` ).join(",")}]`
    }
}