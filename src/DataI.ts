
export class DataI
{
    readonly int: bigint

    constructor( int: number | bigint = 0 )
    {
        int = BigInt( int );
        this.int = int;
    }

    clone(): DataI
    {
        return new DataI( this.int );
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