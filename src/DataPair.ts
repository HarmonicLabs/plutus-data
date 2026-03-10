import { Data, isData } from "./Data";

/**
 * @deprecated
 */
export class DataPair<DataFst extends Data, DataSnd extends Data>
{
    readonly fst: DataFst;
    readonly snd: DataSnd;

    constructor( fst: DataFst, snd: DataSnd )
    {
        if(!(
            isData( fst ) && isData( snd )
        )) throw new TypeError(
            `invalid Data passed to 'DataPair' constructor; fst: ${fst}; snd: ${snd}`
        );
        this.fst = fst;
        this.snd = snd;
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