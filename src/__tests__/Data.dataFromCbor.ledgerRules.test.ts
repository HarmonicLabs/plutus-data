import { Cbor } from "@harmoniclabs/cbor";
import { DataB } from "../DataB";
import { DataConstr } from "../DataConstr";
import { DataI } from "../DataI";
import { DataList } from "../DataList";
import { dataFromCbor, dataFromCborObj } from "../fromCbor";

/**
 * cardano-ledger decodes `plutus_data` with plutus-core's `decodeData`
 * (PlutusCore/Data.hs); node-diversity-conformance item 573 lists what the
 * old decoder let through (unknown tags read as their payload, byte strings
 * over 64 bytes, ...).
 */

const hexN = ( n: number, byte = "ab" ) => byte.repeat( n );
const bytesHead = ( n: number ) => n < 24 ? ( 0x40 + n ).toString( 16 ) : "58" + n.toString( 16 ).padStart( 2, "0" );

describe("dataFromCbor follows cardano-ledger's Data decoder", () => {

    describe("accepted", () => {

        test.each([
            [ "byte string of 64 bytes", "5840" + hexN( 64 ), new DataB( hexN( 64 ) ) ],
            [ "chunked bytes over 64", "5f" + "5840" + hexN( 64 ) + "4101" + "ff", new DataB( hexN( 64 ) + "01" ) ],
            [ "chunked bytes, empty", "5fff", new DataB( "" ) ],
            [ "bignum of 64 bytes", "c25840" + hexN( 64, "01" ), new DataI( BigInt( "0x" + hexN( 64, "01" ) ) ) ],
            [ "chunked bignum", "c25f5840" + hexN( 64, "01" ) + "4101ff", new DataI( BigInt( "0x" + hexN( 65, "01" ) ) ) ],
            [ "small bignum", "c24101", new DataI( 1 ) ],
            [ "negative bignum", "c34101", new DataI( -2 ) ],
            [ "constr 0 (tag 121)", "d87980", new DataConstr( 0, [] ) ],
            [ "constr 6 (tag 127)", "d87f8101", new DataConstr( 6, [ new DataI( 1 ) ] ) ],
            [ "constr 7 (tag 1280)", "d9050080", new DataConstr( 7, [] ) ],
            [ "constr 127 (tag 1400)", "d9057880", new DataConstr( 127, [] ) ],
            [ "constr 128 (tag 102)", "d8668218809f01ff", new DataConstr( 128, [ new DataI( 1 ) ] ) ],
            [ "tag 102 indefinite pair", "d8669f1880 80ff".replace( " ", "" ), new DataConstr( 128, [] ) ],
            [ "indefinite list", "9f0102ff", new DataList([ new DataI( 1 ), new DataI( 2 ) ]) ],
        ] as const)( "%s", ( _, hex, expected ) => {
            expect( dataFromCbor( hex ) ).toEqual( expected );
            expect( dataFromCborObj( Cbor.parse( hex ) ) ).toEqual( expected );
        });
    });

    describe("rejected", () => {

        test.each([
            [ "byte string of 65 bytes", "5841" + hexN( 65 ) ],
            [ "chunk of 65 bytes", "5f" + "5841" + hexN( 65 ) + "ff" ],
            [ "bignum magnitude of 65 bytes", "c25841" + hexN( 65, "01" ) ],
            [ "bignum chunk of 65 bytes", "c35f5841" + hexN( 65, "01" ) + "ff" ],
            [ "tag 42 over bytes", "d82a40" ],
            [ "tag 24 over bytes", "d81841" + "00" ],
            [ "tag 120", "d87880" ],
            [ "tag 128", "d88080" ],
            [ "tag 1279", "d904ff80" ],
            [ "tag 1401", "d9057980" ],
            [ "tag 2 over a uint", "c201" ],
            [ "tag 3 over a list", "c380" ],
            [ "constr over a map", "d879a0" ],
            [ "constr over bytes", "d87940" ],
            [ "tag 102 with a bignum index", "d86682c2410080" ],
            [ "tag 102 with three elements", "d866830080" + "80" ],
            [ "tag 102 with a non-list field", "d866820001" ],
            [ "text", "6161" ],
            [ "chunked text", "7f6161ff" ],
            [ "false", "f4" ],
            [ "null", "f6" ],
            [ "half float", "f93c00" ],
            [ "double", "fb3ff0000000000000" ],
            [ "text nested in a list", "820160" ],
            [ "65 bytes nested in a constr", "d87981" + "5841" + hexN( 65 ) ],
        ])( "%s", ( _, hex ) => {
            expect( () => dataFromCbor( hex ) ).toThrow();
            expect( () => dataFromCborObj( Cbor.parse( hex ) ) ).toThrow();
        });

        test("trailing bytes", () => {
            expect( () => dataFromCbor( "0100" ) ).toThrow();
            expect( () => dataFromCbor( "d8798000" ) ).toThrow();
            // a parsed object is taken as is
            expect( dataFromCborObj( Cbor.parse( "0100" ) ) ).toEqual( new DataI( 1 ) );
        });
    });

    test("bytes boundary is per chunk", () => {
        const sixtyFour = "5840" + hexN( 64 );
        const chunked = "5f" + sixtyFour + sixtyFour + sixtyFour + "ff";
        expect( ( dataFromCbor( chunked ) as DataB ).bytes.length ).toBe( 192 );
        expect( () => dataFromCbor( bytesHead( 65 ) + hexN( 65 ) ) ).toThrow();
    });
});
