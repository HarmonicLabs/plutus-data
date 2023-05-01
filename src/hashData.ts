import { blake2b_256 } from "@harmoniclabs/crypto";
import { Data, isData } from "./Data";
import { dataToCbor } from "./toCbor";

export function hashData( data: Data ): Uint8Array
{
    if( !isData( data ) )
    throw new Error(
        "hashData only works with Data"
    );

    return blake2b_256( dataToCbor( data ).toBuffer() )
}