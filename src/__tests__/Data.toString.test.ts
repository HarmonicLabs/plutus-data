import { Data, DataB, DataConstr, DataI, DataList, DataMap, DataPair, dataFromCbor, dataFromString } from ".."

describe("data.toString", () => {

    test("some ctx", () => {

        const data = dataFromCbor("d8799fd8799f9fd8799fd8799fd8799f5820a12c24a202c169fa0317e7b5894039621ce11c26b574c98f0245e088c90bc36fff00ffd8799fd8799fd87a9f581ce02ca1eb4f70ce9240c1f2fc8ee62404c0f7d636119e135619f3f043ffd87a80ffbf40bf401a0027db34ff581ce02ca1eb4f70ce9240c1f2fc8ee62404c0f7d636119e135619f3f043bf466974616d616501ffffd87b9fd8799f01582000000c18082d40cefb61d5a131852882cfe1271ace25c226ecf6c627865c80da05193fff1a000123041b0000018ca82875680080ffffd87a80ffffd8799fd8799fd8799f5820a12c24a202c169fa0317e7b5894039621ce11c26b574c98f0245e088c90bc36fff01ffd8799fd8799fd8799f581c13867b04db054caa9655378fe37fedee7029924fbe1243887dc35fd8ffd87a80ffbf40bf401b0000000240cb2e9cff581ce02ca1eb4f70ce9240c1f2fc8ee62404c0f7d636119e135619f3f043bf4754454d505552411b000000012a05f200ffffd87980d87a80ffffff9fd8799fd8799fd8799f5820d30c9aa98b37dfe1f8d6430baa2913326b914b9318f6986a73c0d1ffae4aec29ff00ffd8799fd8799fd87a9f581ce02ca1eb4f70ce9240c1f2fc8ee62404c0f7d636119e135619f3f043ffd87a80ffbf40bf401a00cd0ec4ffffd87b9f00ffd8799f581ce02ca1eb4f70ce9240c1f2fc8ee62404c0f7d636119e135619f3f043ffffffd8799fd8799fd8799f5820d30c9aa98b37dfe1f8d6430baa2913326b914b9318f6986a73c0d1ffae4aec29ff00ffd8799fd8799fd87a9f581ce02ca1eb4f70ce9240c1f2fc8ee62404c0f7d636119e135619f3f043ffd87a80ffbf40bf401a00cd0ec4ffffd87b9f00ffd8799f581ce02ca1eb4f70ce9240c1f2fc8ee62404c0f7d636119e135619f3f043ffffffff9fd8799fd8799fd87a9f581ce02ca1eb4f70ce9240c1f2fc8ee62404c0f7d636119e135619f3f043ffd87a80ffbf40bf401a00371d74ff581ce02ca1eb4f70ce9240c1f2fc8ee62404c0f7d636119e135619f3f043bf466974616d616501ffffd87b9fd8799f0258200000018cf9961cfcb0aac02a835078860694e3941ec32fa54e5937f3113bd770051930f61a3728cfbc1b0000018cdf502220009f58200000018cf9961cfcb0aac02a835078860694e3941ec32fa54e5937f3113bd770ffffffd87a80ffd8799fd8799fd8799f581c13867b04db054caa9655378fe37fedee7029924fbe1243887dc35fd8ffd87a80ffbf40bf401b0000000240b64826ff581ce02ca1eb4f70ce9240c1f2fc8ee62404c0f7d636119e135619f3f043bf4754454d505552411b00000002540be400ffffd87980d87a80ffffbf40bf401a0005a436ffffbf40bf4000ff581ce02ca1eb4f70ce9240c1f2fc8ee62404c0f7d636119e135619f3f043bf4754454d505552411b000000012a05f200ffff80a0d8799fd8799fd87a9f1b0000018cdf4ec290ffd87980ffd8799fd87a9f1b0000018cdf5181b0ffd87980ffff80bfd87a9fd8799fd8799f5820a12c24a202c169fa0317e7b5894039621ce11c26b574c98f0245e088c90bc36fff00ffffd87a9f50a41bf9f630b6910247112d2193e4c079ffd8799f581ce02ca1eb4f70ce9240c1f2fc8ee62404c0f7d636119e135619f3f043ffd87980ffa05820432724f48368ef3f4cdca987ffc189a8f4b40a0581269499fb6a13f327b2f5e0ffd87a9fd8799fd8799f5820a12c24a202c169fa0317e7b5894039621ce11c26b574c98f0245e088c90bc36fff00ffffff");

        expect( data.toString() ).toEqual("Constr 0 [Constr 0 [List [Constr 0 [Constr 0 [Constr 0 [B #a12c24a202c169fa0317e7b5894039621ce11c26b574c98f0245e088c90bc36f],I 0],Constr 0 [Constr 0 [Constr 1 [B #e02ca1eb4f70ce9240c1f2fc8ee62404c0f7d636119e135619f3f043],Constr 1 []],Map [(B #,Map [(B #,I 2612020)]),(B #e02ca1eb4f70ce9240c1f2fc8ee62404c0f7d636119e135619f3f043,Map [(B #6974616d6165,I 1)])],Constr 2 [Constr 0 [I 1,B #00000c18082d40cefb61d5a131852882cfe1271ace25c226ecf6c627865c80da,I 5,I 16383,I 74500,I 1703628273000,I 0,List []]],Constr 1 []]],Constr 0 [Constr 0 [Constr 0 [B #a12c24a202c169fa0317e7b5894039621ce11c26b574c98f0245e088c90bc36f],I 1],Constr 0 [Constr 0 [Constr 0 [B #13867b04db054caa9655378fe37fedee7029924fbe1243887dc35fd8],Constr 1 []],Map [(B #,Map [(B #,I 9676992156)]),(B #e02ca1eb4f70ce9240c1f2fc8ee62404c0f7d636119e135619f3f043,Map [(B #54454d50555241,I 5000000000)])],Constr 0 [],Constr 1 []]]],List [Constr 0 [Constr 0 [Constr 0 [B #d30c9aa98b37dfe1f8d6430baa2913326b914b9318f6986a73c0d1ffae4aec29],I 0],Constr 0 [Constr 0 [Constr 1 [B #e02ca1eb4f70ce9240c1f2fc8ee62404c0f7d636119e135619f3f043],Constr 1 []],Map [(B #,Map [(B #,I 13438660)])],Constr 2 [I 0],Constr 0 [B #e02ca1eb4f70ce9240c1f2fc8ee62404c0f7d636119e135619f3f043]]],Constr 0 [Constr 0 [Constr 0 [B #d30c9aa98b37dfe1f8d6430baa2913326b914b9318f6986a73c0d1ffae4aec29],I 0],Constr 0 [Constr 0 [Constr 1 [B #e02ca1eb4f70ce9240c1f2fc8ee62404c0f7d636119e135619f3f043],Constr 1 []],Map [(B #,Map [(B #,I 13438660)])],Constr 2 [I 0],Constr 0 [B #e02ca1eb4f70ce9240c1f2fc8ee62404c0f7d636119e135619f3f043]]]],List [Constr 0 [Constr 0 [Constr 1 [B #e02ca1eb4f70ce9240c1f2fc8ee62404c0f7d636119e135619f3f043],Constr 1 []],Map [(B #,Map [(B #,I 3612020)]),(B #e02ca1eb4f70ce9240c1f2fc8ee62404c0f7d636119e135619f3f043,Map [(B #6974616d6165,I 1)])],Constr 2 [Constr 0 [I 2,B #0000018cf9961cfcb0aac02a835078860694e3941ec32fa54e5937f3113bd770,I 5,I 12534,I 925421500,I 1704553620000,I 0,List [B #0000018cf9961cfcb0aac02a835078860694e3941ec32fa54e5937f3113bd770]]],Constr 1 []],Constr 0 [Constr 0 [Constr 0 [B #13867b04db054caa9655378fe37fedee7029924fbe1243887dc35fd8],Constr 1 []],Map [(B #,Map [(B #,I 9675622438)]),(B #e02ca1eb4f70ce9240c1f2fc8ee62404c0f7d636119e135619f3f043,Map [(B #54454d50555241,I 10000000000)])],Constr 0 [],Constr 1 []]],Map [(B #,Map [(B #,I 369718)])],Map [(B #,Map [(B #,I 0)]),(B #e02ca1eb4f70ce9240c1f2fc8ee62404c0f7d636119e135619f3f043,Map [(B #54454d50555241,I 5000000000)])],List [],Map [],Constr 0 [Constr 0 [Constr 1 [I 1704553530000],Constr 0 []],Constr 0 [Constr 1 [I 1704553710000],Constr 0 []]],List [],Map [(Constr 1 [Constr 0 [Constr 0 [B #a12c24a202c169fa0317e7b5894039621ce11c26b574c98f0245e088c90bc36f],I 0]],Constr 1 [B #a41bf9f630b6910247112d2193e4c079]),(Constr 0 [B #e02ca1eb4f70ce9240c1f2fc8ee62404c0f7d636119e135619f3f043],Constr 0 [])],Map [],B #432724f48368ef3f4cdca987ffc189a8f4b40a0581269499fb6a13f327b2f5e0],Constr 1 [Constr 0 [Constr 0 [B #a12c24a202c169fa0317e7b5894039621ce11c26b574c98f0245e088c90bc36f],I 0]]]");

    });

});

describe("dataFromString", () => {

    test("I", () => {

        function testI( n: number )
        {
            const data = new DataI( n );
            const str = `I ${n}`;
            expect( data.toString() ).toEqual(str);
            expect( dataFromString( str ) ).toEqual( data );
        }

        testI( 1 );
        testI( 69 );
        testI( 420 );
        testI( 10_000_000 );
    });

    test("B", () => {

        function testB( hex: string )
        {
            const data = new DataB( hex );
            const str = `B #${hex}`;
            expect( data.toString() ).toEqual(str);
            expect( dataFromString( str ) ).toEqual( data );
        }

        testB("01");
        testB("caffee");
        testB("abcdef0123456789");
        testB("a12c24a202c169fa0317e7b5894039621ce11c26b574c98f0245e088c90bc36f");
    });

    test("Constr", () => {

        function testData( data: Data )
        {
            const str = data.toString();
            expect( dataFromString( str ) ).toEqual( data );
        }

        testData(new DataConstr(0,[]));
        testData(new DataConstr(0,[new DataI(0)]));
        testData(new DataConstr(0,[new DataB("a12c24a202c169fa0317e7b5894039621ce11c26b574c98f0245e088c90bc36f"), new DataI(0)]));
        // testData(new DataConstr(0,[]));
        // testData(new DataConstr(0,[]));
    });

    test("correct list", () => {

        const str = `List [I 1,I 2,I 3]`;

        expect( dataFromString( str ) )
        .toEqual(
            new DataList([
                new DataI( 1 ),
                new DataI( 2 ),
                new DataI( 3 )
            ])
        )
    });

    test("incorrect map as list", () => {

        const str = `List [(I 1, I 2)]`;

        expect( () => dataFromString( str ) ).toThrow
    })

    test("map", () => {
        const str = `Map [ (B #0123, I 12345),
            (I 789453, B #456789),
            (List [I -12364689486], Constr 7 [])
        ]`;

        expect( dataFromString( str ) )
        .toEqual(
            new DataMap([
                new DataPair( new DataB("0123"), new DataI(12345) ),
                new DataPair( new DataI(789453), new DataB("456789") ),
                new DataPair( new DataList([ new DataI(-12364689486) ]), new DataConstr(7,[]) )
            ] as DataPair<Data,Data>[])
        );
    })

    test("ctx", () => {

        const data = dataFromCbor("d8799fd8799f9fd8799fd8799fd8799f5820a12c24a202c169fa0317e7b5894039621ce11c26b574c98f0245e088c90bc36fff00ffd8799fd8799fd87a9f581ce02ca1eb4f70ce9240c1f2fc8ee62404c0f7d636119e135619f3f043ffd87a80ffbf40bf401a0027db34ff581ce02ca1eb4f70ce9240c1f2fc8ee62404c0f7d636119e135619f3f043bf466974616d616501ffffd87b9fd8799f01582000000c18082d40cefb61d5a131852882cfe1271ace25c226ecf6c627865c80da05193fff1a000123041b0000018ca82875680080ffffd87a80ffffd8799fd8799fd8799f5820a12c24a202c169fa0317e7b5894039621ce11c26b574c98f0245e088c90bc36fff01ffd8799fd8799fd8799f581c13867b04db054caa9655378fe37fedee7029924fbe1243887dc35fd8ffd87a80ffbf40bf401b0000000240cb2e9cff581ce02ca1eb4f70ce9240c1f2fc8ee62404c0f7d636119e135619f3f043bf4754454d505552411b000000012a05f200ffffd87980d87a80ffffff9fd8799fd8799fd8799f5820d30c9aa98b37dfe1f8d6430baa2913326b914b9318f6986a73c0d1ffae4aec29ff00ffd8799fd8799fd87a9f581ce02ca1eb4f70ce9240c1f2fc8ee62404c0f7d636119e135619f3f043ffd87a80ffbf40bf401a00cd0ec4ffffd87b9f00ffd8799f581ce02ca1eb4f70ce9240c1f2fc8ee62404c0f7d636119e135619f3f043ffffffd8799fd8799fd8799f5820d30c9aa98b37dfe1f8d6430baa2913326b914b9318f6986a73c0d1ffae4aec29ff00ffd8799fd8799fd87a9f581ce02ca1eb4f70ce9240c1f2fc8ee62404c0f7d636119e135619f3f043ffd87a80ffbf40bf401a00cd0ec4ffffd87b9f00ffd8799f581ce02ca1eb4f70ce9240c1f2fc8ee62404c0f7d636119e135619f3f043ffffffff9fd8799fd8799fd87a9f581ce02ca1eb4f70ce9240c1f2fc8ee62404c0f7d636119e135619f3f043ffd87a80ffbf40bf401a00371d74ff581ce02ca1eb4f70ce9240c1f2fc8ee62404c0f7d636119e135619f3f043bf466974616d616501ffffd87b9fd8799f0258200000018cf9961cfcb0aac02a835078860694e3941ec32fa54e5937f3113bd770051930f61a3728cfbc1b0000018cdf502220009f58200000018cf9961cfcb0aac02a835078860694e3941ec32fa54e5937f3113bd770ffffffd87a80ffd8799fd8799fd8799f581c13867b04db054caa9655378fe37fedee7029924fbe1243887dc35fd8ffd87a80ffbf40bf401b0000000240b64826ff581ce02ca1eb4f70ce9240c1f2fc8ee62404c0f7d636119e135619f3f043bf4754454d505552411b00000002540be400ffffd87980d87a80ffffbf40bf401a0005a436ffffbf40bf4000ff581ce02ca1eb4f70ce9240c1f2fc8ee62404c0f7d636119e135619f3f043bf4754454d505552411b000000012a05f200ffff80a0d8799fd8799fd87a9f1b0000018cdf4ec290ffd87980ffd8799fd87a9f1b0000018cdf5181b0ffd87980ffff80bfd87a9fd8799fd8799f5820a12c24a202c169fa0317e7b5894039621ce11c26b574c98f0245e088c90bc36fff00ffffd87a9f50a41bf9f630b6910247112d2193e4c079ffd8799f581ce02ca1eb4f70ce9240c1f2fc8ee62404c0f7d636119e135619f3f043ffd87980ffa05820432724f48368ef3f4cdca987ffc189a8f4b40a0581269499fb6a13f327b2f5e0ffd87a9fd8799fd8799f5820a12c24a202c169fa0317e7b5894039621ce11c26b574c98f0245e088c90bc36fff00ffffff");

        const str = data.toString();

        const parsed = dataFromString( str );

        expect( parsed.toString() ).toEqual( str );
    });
})