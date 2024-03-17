import { ByteString } from "@harmoniclabs/bytestring";
import { Data } from "./Data";
import { DataB } from "./DataB";
import { DataConstr } from "./DataConstr";
import { DataI } from "./DataI";
import { DataList } from "./DataList";
import { DataPair } from "./DataPair";
import { DataMap } from "./DataMap";

type FormattedBrackets
    = [`Constr ${bigint}`, FormattedBrackets[] ]
    | ["Map", { k: FormattedBrackets, v: FormattedBrackets }[] ]
    | ["List", FormattedBrackets[] ]
    | [ string ];
    // | [`I ${bigint}` ]
    // | [`B #${string}`];

function formatStringByBrackets( str: string ): FormattedBrackets
{
    const openBracketIdx = str.indexOf("[");
    if( openBracketIdx < 0 )
    {
        str = str.trim();
        return [ str ]; // I or B
    }
    const start = str.slice(0, openBracketIdx ).trim();
    
    let prev = openBracketIdx + 1;
    let i = prev;
    let ch = "";
    let nOpen = 0;
    const isMap = start.startsWith("Map");
    let insidePair = false;
    let pairK: FormattedBrackets | undefined = undefined;

    const rest: (FormattedBrackets | { k: FormattedBrackets, v: FormattedBrackets })[] = [];
    
    while( true )
    {
        ch = str[i];
        switch( ch )
        {
            case "[": {
                nOpen++;
                break;
            }
            case "]": {
                if( nOpen === 0 )
                {
                    const elem = str.substring( prev, i ).trim();
                    if( elem !== "" ) rest.push([ elem ]);
                    return [ start, rest ] as any;
                }
                else nOpen--;
                break;
            }
            case ",": {
                if( nOpen === 0 )
                {
                    if( !isMap )
                    {
                        rest.push( formatStringByBrackets( str.substring( prev, i ) ) );
                        prev = i + 1;
                    }
                    else
                    {
                        if( insidePair )
                        {
                            if( str[prev] === "," ) prev++;
                            if( str[prev] === "(" ) prev++;
                            pairK = formatStringByBrackets( str.substring( prev, i ) );
                            prev = i + 1;
                        }
                        else break;
                    }
                }
                break;
            }
            case "(": {
                if( nOpen === 0 ) insidePair = true;
                break;
            }
            case ")": {
                if( nOpen === 0 )
                {
                    const v = formatStringByBrackets( str.substring( prev, i ) );
                    prev = i + 1;

                    rest.push({ k: pairK!, v });
                    pairK = undefined;

                    insidePair = false;
                }
                break;
            }
            default: break;
        }
        i++;
    }
}
/**
 * parses the result of `data.toString()`
 * 
 * @param {string} str data
 */
export function dataFromString( str: string ): Data
{
    const words = formatStringByBrackets( str );

    return parseWords( words );
}

function parseWords( words: FormattedBrackets ): Data
{
    let start = words[0];
    while( start.startsWith("(") ) start = start.slice(1);
    if( start.startsWith("Constr") )
    {
        const [_, idxStr] = start.split(" ");
        const idx = BigInt( idxStr );
        if( Array.isArray( words[1] ) )
        {
            const fields = ( words[1] as FormattedBrackets[] ).map( parseWords );
            return new DataConstr( idx, fields );
        }
        else return dataFromString( words[0] as any );
    }
    if( start.startsWith("Map") )
    {
        if( Array.isArray( words[1] ) )
        {
            const pairs = words[1] as { k: FormattedBrackets, v: FormattedBrackets }[];
            return new DataMap( pairs.map(({ k,v }) => new DataPair( parseWords(k), parseWords(v) ) )); 
        }
        else return dataFromString( words[0] );
    }
    if( start.startsWith("List") )
    {
        if( Array.isArray( words[1] ) )
        {
            return new DataList( ( words[1] as FormattedBrackets[] ).map( parseWords ) );
        }
        else return dataFromString( words[0] )
    }
    if( start[0] === "I" )
    {
        const [ _, valStr ] = start.split(" ");
        return new DataI( BigInt( valStr ) );
    }
    if( start[0] === "B" )
    {
        const [ _, valStr ] = start.split("#");
        return new DataB( valStr.trim() );
    }
    
    console.log( words )
    throw new Error("invalid string to parse Data");
}