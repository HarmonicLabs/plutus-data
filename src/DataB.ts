import { ByteString } from "@harmoniclabs/bytestring";
import { roDescr } from "./utils/roDescr";

export class DataB
{
    readonly bytes: ByteString

    constructor( B: ByteString | Uint8Array | string )
    {
        if(!(B instanceof ByteString)) B = new ByteString( B );

        const _bytes = B.clone();

        Object.defineProperties(
            this, {
                bytes: { value: _bytes, ...roDescr }
            }
        );
    }

    clone(): DataB
    {
        // the constructor clones the bytes
        return new DataB( this.bytes );
    }

    toJson()
    {
        return { bytes: this.bytes.toString() }
    }

    toString(): string
    {
        return `B #${this.bytes.toString()}`
    }
}