# @harmoniclabs/plutus-data

Typescript definition of the generic `Data` type for plutus applicaitons

```ts
type Data 
    = DataConstr
    | DataMap<Data, Data>
    | DataList
    | DataI
    | DataB;
```