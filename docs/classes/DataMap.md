**@harmoniclabs/plutus-data** • [Readme](../README.md) \| [API](../globals.md)

***

[@harmoniclabs/plutus-data](../README.md) / DataMap

# Class: DataMap\<DataKey, DataValue\>

## Type parameters

• **DataKey** extends [`Data`](../type-aliases/Data.md)

• **DataValue** extends [`Data`](../type-aliases/Data.md)

## Constructors

### new DataMap(map)

> **new DataMap**\<`DataKey`, `DataValue`\>(`map`): [`DataMap`](DataMap.md)\<`DataKey`, `DataValue`\>

#### Parameters

• **map**: [`DataPair`](DataPair.md)\<`DataKey`, `DataValue`\>[]

#### Returns

[`DataMap`](DataMap.md)\<`DataKey`, `DataValue`\>

#### Source

[DataMap.ts:11](https://github.com/HarmonicLabs/plutus-data/blob/911664c/src/DataMap.ts#L11)

## Properties

### map

> **`readonly`** **map**: [`DataPair`](DataPair.md)\<`DataKey`, `DataValue`\>[]

#### Source

[DataMap.ts:9](https://github.com/HarmonicLabs/plutus-data/blob/911664c/src/DataMap.ts#L9)

## Methods

### clone()

> **clone**(): [`DataMap`](DataMap.md)\<`DataKey`, `DataValue`\>

#### Returns

[`DataMap`](DataMap.md)\<`DataKey`, `DataValue`\>

#### Source

[DataMap.ts:29](https://github.com/HarmonicLabs/plutus-data/blob/911664c/src/DataMap.ts#L29)

***

### toJson()

> **toJson**(): `Object`

#### Returns

`Object`

##### map

> **map**: `Object`[]

#### Source

[DataMap.ts:36](https://github.com/HarmonicLabs/plutus-data/blob/911664c/src/DataMap.ts#L36)

***

### toString()

> **toString**(): `string`

#### Returns

`string`

#### Source

[DataMap.ts:48](https://github.com/HarmonicLabs/plutus-data/blob/911664c/src/DataMap.ts#L48)
