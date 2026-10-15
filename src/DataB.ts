import { fromHex, toHex } from "@harmoniclabs/uint8array-utils";
import { SubCborRef } from "@harmoniclabs/cbor";
import { getDataCborRef, setDataCborRef } from "./cborRef";

export class DataB
{
    readonly bytes: Uint8Array;

    constructor( bytes: Uint8Array | string, cborRef?: SubCborRef )
    {
        if( typeof bytes === "string" ) bytes = fromHex( bytes );
        if(!( bytes instanceof Uint8Array ) ) throw new TypeError( "invalid bytes passed to constructor" );

        this.bytes = bytes;
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

    clone(): DataB
    {
        // the constructor clones the bytes
        return new DataB( this.bytes, this.cborRef?.clone() );
    }

    toJSON() { return this.toJson(); }
    toJson()
    {
        return { bytes: toHex( this.bytes ) }
    }

    toString(): string
    {
        return `B #${toHex( this.bytes )}`
    }
}