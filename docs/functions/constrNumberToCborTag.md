**@harmoniclabs/plutus-data** • [Readme](../README.md) \| [API](../globals.md)

***

[@harmoniclabs/plutus-data](../README.md) / constrNumberToCborTag

# Function: constrNumberToCborTag()

> **constrNumberToCborTag**(`uint`): `bigint`

Note [CBOR alternative tags]

We've proposed to add additional tags to the CBOR standard to cover (essentially) sum types.
This is exactly what we need to encode the 'Constr' constructor of 'Data' in an unambiguous way.
The tags aren't *quite* accepted yet, but they're clearly going to accept so we might as well
start using them.
The scheme is:
- Alternatives 0-6 -> tags 121-127, followed by the arguments in a list
- Alternatives 7-127 -> tags 1280-1400, followed by the arguments in a list
- Any alternatives, including those that don't fit in the above -> tag 102 followed by a list containing
an unsigned integer for the actual alternative, and then the arguments in a (nested!) list.

## Parameters

• **uint**: `bigint`

## Returns

`bigint`

## Source

[DataConstr.ts:61](https://github.com/HarmonicLabs/plutus-data/blob/911664c/src/DataConstr.ts#L61)
