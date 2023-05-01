import { Data, isData } from "./Data";
import { assert } from "./utils/assert";

export class DataPair<DataFst extends Data, DataSnd extends Data>
{
    private _fst: DataFst;
    get fst(): DataFst { return Object.freeze( this._fst ) };
    set fst( v: DataFst )
    {
        assert(
            isData( v ),
            `invalid Data passed setting 'fst' in 'DataPair'; value: ${v}`
        );
        this._fst = v
    };

    private _snd: DataSnd;
    get snd(): DataSnd { return Object.freeze( this._snd ) };
    set snd( v: DataSnd )
    {
        assert(
            isData( v ),
            `invalid Data passed setting 'snd' in 'DataPair'; value: ${v}`
        );
        this._snd = v
    };

    constructor( fst: DataFst, snd: DataSnd )
    {
        assert(
            isData( fst ) && isData( snd ),
            `invalid Data passed to 'DataPair' constructor; fst: ${fst}; snd: ${snd}`
        );
        this._fst = fst.clone() as any;
        this._snd = snd.clone() as any;
    }

    clone(): DataPair<DataFst,DataSnd>
    {
        // the constructor clones both fst and snd
        return new DataPair( this.fst, this.snd ) as any;
    }
}