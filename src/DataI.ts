
import { SubCborRef } from "@harmoniclabs/cbor";
import { getDataCborRef, setDataCborRef } from "./cborRef";

export class DataI
{
    readonly int: bigint

    constructor( int: number | bigint = 0, cborRef?: SubCborRef )
    {
        int = BigInt( int );
        this.int = int;
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

    clone(): DataI
    {
        return new DataI( this.int, this.cborRef?.clone() );
    }

    toJSON() { return this.toJson(); }
    toJson()
    {
        return { int: this.int.toString() }
    }

    toString(): string
    {
        return `I ${this.int.toString()}`;
    }
}