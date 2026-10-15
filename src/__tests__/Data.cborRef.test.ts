import { Cbor, CborArray, CborTag } from "@harmoniclabs/cbor";
import { fromHex, toHex } from "@harmoniclabs/uint8array-utils";
import { blake2b_256 } from "@harmoniclabs/crypto";
import { DataB } from "../DataB";
import { DataConstr } from "../DataConstr";
import { DataI } from "../DataI";
import { DataList } from "../DataList";
import { DataMap } from "../DataMap";
import { dataFromCbor, dataFromCborObj } from "../fromCbor";
import { dataToCbor, dataToCborObj } from "../toCbor";
import { hashData } from "../hashData";
import { getDataCborRef } from "../cborRef";

/**
 * cardano-ledger keeps the bytes Plutus Data was decoded from, and hashes
 * and re-serialises those; a decoded value must re-encode to its source
 * bytes (node-diversity-conformance item 584: `d8798101` used to come back
 * as `d8799f01ff`).
 */
describe("decoded Data keeps its source bytes", () => {

    test.each([
        "d8798101",             // definite fields (canonical form is indefinite)
        "d87980",
        "d8799fff",             // empty indefinite fields
        "9fff",
        "80",
        "83010203",
        "9f0102ff",
        "a10102",               // definite map
        "bf0102ff",
        "1800",                 // non-minimal uint head
        "1b0000000000000001",
        "3800",
        "c24101",               // bignum with a small value
        "c240",                 // empty magnitude
        "c34100",
        "4401020304",
        "5f42010241ffff",       // chunked, short chunks
        "d9050080",             // constr 7
        "d8668218809f01ff",     // tag 102
        "d87982d87981581c" + "11".repeat( 28 ) + "9f1903e8c2420001ff",
    ])( "%s", hex => {
        for( const d of [ dataFromCbor( hex ), dataFromCborObj( Cbor.parse( hex ) ) ] )
        {
            expect( toHex( dataToCbor( d ) ) ).toEqual( hex );
            expect( toHex( Cbor.encode( dataToCborObj( d ) ) ) ).toEqual( hex );
            expect( toHex( d.cborRef!.toBuffer() ) ).toEqual( hex );
            expect( toHex( getDataCborRef( d )!.toBuffer() ) ).toEqual( hex );
            expect( toHex( dataToCbor( d.clone() ) ) ).toEqual( hex );
            expect( toHex( hashData( d ) ) ).toEqual( toHex( blake2b_256( fromHex( hex ) ) ) );
        }
    });

    test("non-minimal tag head is kept", () => {
        const hex = "d9007980";
        const d = dataFromCbor( hex );
        expect( d ).toEqual( new DataConstr( 0, [] ) );
        expect( toHex( dataToCbor( d ) ) ).toEqual( hex );
        // through CborObj too (needs @harmoniclabs/cbor with CborTag.addInfos)
        expect( toHex( Cbor.encode( dataToCborObj( d ) ) ) ).toEqual( hex );
    });

    test("nested values keep their own bytes", () => {
        const d = dataFromCbor( "d8798281011800" ) as DataConstr;
        expect( toHex( dataToCbor( d.fields[0] ) ) ).toEqual( "8101" );
        expect( toHex( dataToCbor( d.fields[1] ) ) ).toEqual( "1800" );
        // a constructed parent is encoded canonically around them
        const rebuilt = new DataList([ d.fields[0], new DataI( 0 ) ]);
        expect( toHex( dataToCbor( rebuilt ) ) ).toEqual( "9f810100ff" );
    });

    test("structural equality is unaffected", () => {
        expect( dataFromCbor( "d8798101" ) ).toEqual( new DataConstr( 0, [ new DataI( 1 ) ] ) );
        expect( dataFromCbor( "a10102" ) ).toEqual( new DataMap([ { fst: new DataI( 1 ), snd: new DataI( 2 ) } ]) );
        expect( Object.keys( dataFromCbor( "4101" ) ) ).toEqual([ "bytes" ]);
        expect( JSON.stringify( dataFromCbor( "8101" ) ) ).toEqual( JSON.stringify( new DataList([ new DataI( 1 ) ]) ) );
    });

    test("constructed values are encoded as before", () => {
        expect( new DataI( 1 ).cborRef ).toBeUndefined();
        expect( toHex( dataToCbor( new DataConstr( 0, [ new DataI( 1 ) ] ) ) ) ).toEqual( "d8799f01ff" );
        expect( toHex( dataToCbor( new DataList([]) ) ) ).toEqual( "80" );
        expect( toHex( dataToCbor( new DataMap([ { fst: new DataI( 1 ), snd: new DataB( "" ) } ]) ) ) ).toEqual( "bf0140ff" );
        expect( toHex( dataToCbor( new DataB( "ab".repeat( 65 ) ) ) ) ).toEqual( "5f5840" + "ab".repeat( 64 ) + "41abff" );
    });

    test("a ref can be passed to the constructors", () => {
        const ref = Cbor.parse( "1800" ).subCborRef!;
        expect( toHex( dataToCbor( new DataI( 0, ref ) ) ) ).toEqual( "1800" );
    });

    test("works when the cbor build does not keep tag refs", () => {
        const hex = "82" + "d9007980" + "d8798101";
        const parsed = Cbor.parse( hex ) as CborArray;
        for( const t of parsed.array ) ( t as CborTag ).subCborRef = undefined;
        const d = dataFromCborObj( parsed ) as DataList;
        expect( toHex( dataToCbor( d.list[0] ) ) ).toEqual( "d9007980" );
        expect( toHex( dataToCbor( d.list[1] ) ) ).toEqual( "d8798101" );
        expect( toHex( dataToCbor( d ) ) ).toEqual( hex );
    });

    test("without refs (keepRef: false) the canonical encoding is used", () => {
        const d = dataFromCborObj( Cbor.parse( "d8798101", { keepRef: false } ) );
        expect( d.cborRef ).toBeUndefined();
        expect( toHex( dataToCbor( d ) ) ).toEqual( "d8799f01ff" );
    });
});

test("tag 102 needs a field list", () => {
    expect( () => dataFromCbor( "d866821880d87980" ) ).toThrow();
});
