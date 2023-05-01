import { CanBeUInteger, forceBigUInt } from "@harmoniclabs/biguint";
import { Data, isData } from "./Data";
import { assert } from "./utils/assert";

export class DataConstr
{
    private _constr: bigint;
    get constr(): bigint { return this._constr };

    private _fields: Data[]
    get fields(): Data[] { return this._fields.map( dataElem => Object.freeze( dataElem ) as any ) };

    constructor( constr: CanBeUInteger, fields: Data[] )
    {
        assert(
            fields.every( isData ),
            "invalid fields passed to constructor"
        );

        this._constr = forceBigUInt( constr );
        this._fields = fields.map( dataElem =>  dataElem.clone() );
    }

    clone(): DataConstr
    {
        return new DataConstr(
            this._constr,
            this._fields
            //.map( dataElem => dataElem.clone() ) as Data[]
            // the constructor clones the fields
        );
    }

    toJson(): any
    {
        return {
            constr: Number( this._constr ),
            fields: this._fields.map( f => f.toJson() )
        }
    }
}

/**
 * Note [CBOR alternative tags]
 * 
 * We've proposed to add additional tags to the CBOR standard to cover (essentially) sum types.
 * This is exactly what we need to encode the 'Constr' constructor of 'Data' in an unambiguous way.
 * The tags aren't *quite* accepted yet, but they're clearly going to accept so we might as well
 * start using them.
 * The scheme is:
 * - Alternatives 0-6 -> tags 121-127, followed by the arguments in a list
 * - Alternatives 7-127 -> tags 1280-1400, followed by the arguments in a list
 * - Any alternatives, including those that don't fit in the above -> tag 102 followed by a list containing
 * an unsigned integer for the actual alternative, and then the arguments in a (nested!) list.
 */
export function constrNumberToCborTag( uint: bigint ): bigint
{
    if( uint < BigInt( 0 ) )
    {
        throw new Error(
            "an unsinged integer was negative; while constructing a CborTag from a DataConstr; tag: " + uint
        );
    }

    if( uint < BigInt( 7 ) )
    {
        return uint + BigInt( 121 );
    }

    if( uint < BigInt( 128 ) )
    {
        // ( 1280 - 7 ) + uint
        return ( BigInt( 1273 ) + uint ) 
    }

    return BigInt( 102 );
}

/**
 * the case ```tag === 102``` should be handled outside the funciton
 * 
 * returns a negative number in case of unrecognized alternative
 */
export function cborTagToConstrNumber( tag: bigint ): bigint
{
    // should never happen being tag unsigned
    // ignores the tag if that's the case
    // negative numbers are returned also in case of unrecognized alternative
    if( tag < 0 ) return tag;

    if( 121 <= tag && tag <= 127 ) return tag - BigInt( 121 );

    if( 1280 <= tag && tag <= 1400  ) return tag - BigInt( 1273 );

    if( tag === BigInt( 102 ) ) return tag;

    // unrecognized alternative
    return BigInt( -1 )
}