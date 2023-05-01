export class DataI
{
    private _int: bigint
    get int(): bigint { return Object.freeze( this._int ) as any }

    constructor( I: number | bigint = 0 )
    {
        this._int = BigInt( I );
    }

    clone(): DataI
    {
        return new DataI(
            this._int
            // .clone()
            // the constructor clones the fields
        );
    }

    toJson()
    {
        return { int: this._int.toString() }
    }
}