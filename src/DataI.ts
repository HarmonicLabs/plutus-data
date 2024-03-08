import { roDescr } from "./utils/roDescr";

export class DataI
{
    readonly int: bigint

    constructor( I: number | bigint = 0 )
    {
        I = BigInt( I );
        Object.defineProperties(
            this, {
                int: { value: I, ...roDescr }
            }
        )
    }

    clone(): DataI
    {
        return new DataI(
            this.int
        );
    }

    toJson()
    {
        return { int: this.int.toString() }
    }

    toString(): string
    {
        return `I ${this.int.toString()}`;
    }
}