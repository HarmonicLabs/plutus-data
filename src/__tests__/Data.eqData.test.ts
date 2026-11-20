import { eqData } from "../Data";
import { DataB } from "../DataB";
import { DataConstr } from "../DataConstr";
import { DataI } from "../DataI";
import { DataList } from "../DataList";
import { DataMap } from "../DataMap";
import { DataPair } from "../DataPair";

// `eqData` is what a CEK machine answers `equalsData` with: structural equality,
// as Plutus' `(==)` on `Data`.

describe("eqData", () => {

    const I = ( n: number ) => new DataI( n );
    const B = ( hex: string ) => new DataB( hex );
    const L = ( ...xs: any[] ) => new DataList( xs );
    const C = ( i: number, ...fields: any[] ) => new DataConstr( i, fields );
    const M = ( ...entries: [ any, any ][] ) => new DataMap( entries.map( ([ k, v ]) => new DataPair( k, v ) ) );

    test("a list is not equal to a longer list it is a prefix of", () => {
        expect( eqData( L(), L( I( 1 ) ) ) ).toBe( false );
        expect( eqData( L( I( 1 ) ), L( I( 1 ), I( 2 ) ) ) ).toBe( false );
        // whichever side is the longer one
        expect( eqData( L( I( 1 ) ), L() ) ).toBe( false );
        expect( eqData( L( I( 1 ), I( 2 ) ), L( I( 1 ) ) ) ).toBe( false );
    });

    test("...also when the list is inside something", () => {
        expect( eqData( C( 0, I( 7 ), L( B( "01" ) ) ), C( 0, I( 7 ), L( B( "01" ), B( "02" ) ) ) ) ).toBe( false );
        expect( eqData( L( L() ), L( L( I( 0 ) ) ) ) ).toBe( false );
        expect( eqData( M( [ I( 1 ), L() ] ), M( [ I( 1 ), L( I( 0 ) ) ] ) ) ).toBe( false );
    });

    test("equal lists are equal", () => {
        expect( eqData( L(), L() ) ).toBe( true );
        expect( eqData( L( I( 1 ), B( "ff" ) ), L( I( 1 ), B( "ff" ) ) ) ).toBe( true );
        expect( eqData( C( 1, L( I( 1 ) ), L() ), C( 1, L( I( 1 ) ), L() ) ) ).toBe( true );
    });

    test("lists of the same length compare element by element", () => {
        expect( eqData( L( I( 1 ), I( 2 ) ), L( I( 1 ), I( 3 ) ) ) ).toBe( false );
        expect( eqData( L( I( 1 ) ), L( B( "01" ) ) ) ).toBe( false );
    });

    test("constructors and maps compare their lengths, as they did", () => {
        expect( eqData( C( 0 ), C( 0, I( 1 ) ) ) ).toBe( false );
        expect( eqData( C( 0, I( 1 ) ), C( 1, I( 1 ) ) ) ).toBe( false );
        expect( eqData( M(), M( [ I( 1 ), I( 2 ) ] ) ) ).toBe( false );
        expect( eqData( M( [ I( 1 ), I( 2 ) ] ), M( [ I( 1 ), I( 2 ) ] ) ) ).toBe( true );
    });

    test("a list is not a constructor, an integer is not bytes", () => {
        expect( eqData( L(), C( 0 ) ) ).toBe( false );
        expect( eqData( I( 1 ), B( "01" ) ) ).toBe( false );
    });
});
