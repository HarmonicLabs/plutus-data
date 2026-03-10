import { fromHex, toHex } from "@harmoniclabs/uint8array-utils";

export class DataB
{
    readonly bytes: Uint8Array;

    constructor( bytes: Uint8Array | string )
    {
        if( typeof bytes === "string" ) bytes = fromHex( bytes );
        if(!( bytes instanceof Uint8Array ) ) throw new TypeError( "invalid bytes passed to constructor" );

        this.bytes = bytes;
    }

    clone(): DataB
    {
        // the constructor clones the bytes
        return new DataB( this.bytes );
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