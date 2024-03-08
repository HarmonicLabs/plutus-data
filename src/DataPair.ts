import { Data, isData } from "./Data";
import { assert } from "./utils/assert";
import { roDescr } from "./utils/roDescr";

export class DataPair<DataFst extends Data, DataSnd extends Data>
{
    readonly fst: DataFst;
    readonly snd: DataSnd;

    constructor( fst: DataFst, snd: DataSnd )
    {
        assert(
            isData( fst ) && isData( snd ),
            `invalid Data passed to 'DataPair' constructor; fst: ${fst}; snd: ${snd}`
        );
        Object.defineProperties(
            this, {
                fst: { value: fst, ...roDescr },
                snd: { value: snd, ...roDescr },
            }
        );
    }

    clone(): DataPair<DataFst,DataSnd>
    {
        return new DataPair( this.fst, this.snd );
    }

    toString(): string
    {
        return `(${this.fst.toString()},${this.snd.toString()})`
    }
}