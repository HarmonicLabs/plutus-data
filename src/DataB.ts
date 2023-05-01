import { ByteString } from "@harmoniclabs/bytestring";

export class DataB
{
    private _bytes: ByteString
    get bytes(): ByteString
    {
        return Object.freeze( this._bytes ) as any
    };

    constructor( B: ByteString | Uint8Array | string )
    {
        if(!(B instanceof ByteString)) B = new ByteString( B );

        this._bytes = B.clone();
    }

    clone(): DataB
    {
        // the constructor clones the bytes
        return new DataB( this._bytes );
    }

    toJson()
    {
        return { bytes: this._bytes.toString() }
    }
}