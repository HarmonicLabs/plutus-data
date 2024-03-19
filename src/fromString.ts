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

function formatStringByBrackets( str: string ): { formatted: FormattedBrackets, offset: number }
{
    const openBracketIdx = str.indexOf("[");
    const bIdx = str.indexOf("B");
    const iIdx = str.indexOf("I");
    if(
        // there is no open bracket
        openBracketIdx < 0 ||
        ( // or
            // we have an open bracket
            // and B is also present
            bIdx >= 0 ?
                // and B is before the open bracket
                bIdx < openBracketIdx :
                (
                    // or I is also present
                    iIdx >= 0 ?
                    // and I is before
                    iIdx < openBracketIdx :
                    // else open bracket comes first
                    false
                )

        )
    )
    {
        const intMatch = str
            // I\s+             -> "I" followed by one or more space
            // \+?\-?           -> may or may nost start with "+" or "-"
            // (?<!\.)          -> MUST NOT have dots before
            // (?<!(#|x)\d*)    -> MUST NOT have before "#" or "x" with 0 or more digits (escluded bls elements and bytestrings)
            // \d+              -> one or more digits
            // (?!(\.|x))       -> MUST NOT have dots after or "x" (x excludes "0x" which are bls elems)
            .match(/I\s+\+?\-?(?<!\.)(?<!(#|x)\d*)\d+(?!(\.|x))/);
        const bsMatch = str.match(/B\s*#[0-9a-fA-F]*/);
        if( !bsMatch && ! intMatch ) throw new Error("expected Data I or B; found none");
        const match = bsMatch && intMatch ?
            (
                str.indexOf( bsMatch[0] ) < str.indexOf( intMatch[0] ) ?
                bsMatch :
                intMatch
            ) :
            (!bsMatch ? intMatch : bsMatch);
        if( !match ) throw new Error("expected Data I or B; found none");
        const formattedStr = match[0];
        return {
            formatted: [ formattedStr ],
            offset: str.indexOf( formattedStr ) + formattedStr.length
        }; // I or B
    }
    const start = str.slice(0, openBracketIdx ).trim();
    
    let prev = openBracketIdx + 1;
    let i = prev;
    let ch = "";
    let nOpen = 0;
    const isMap = /^\(?(\s*)?Map/.test(str);
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
                    return {
                        formatted: [ start, rest ] as FormattedBrackets,
                        offset: i + 1
                    };
                }
                else nOpen--;
                break;
            }
            case ",": {
                if( nOpen === 0 )
                {
                    if( !isMap )
                    {
                        rest.push( formatStringByBrackets( str.substring( prev, i ) ).formatted );
                        prev = i + 1;
                    }
                    else
                    {
                        if( insidePair )
                        {
                            if( str[prev] === "," ) prev++;
                            if( str[prev] === "(" ) prev++;
                            pairK = formatStringByBrackets( str.substring( prev, i ) ).formatted;
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
                    const v = formatStringByBrackets( str.substring( prev, i ) ).formatted;
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
 * 
 * @returns and object with the parsed data and the length of the string used as `offset`
 */
export function dataFromStringWithOffset( str: string ): { data: Data, offset: number }
{
    const { formatted: words, offset } = formatStringByBrackets( str );

    return { data: parseWords( words ), offset };
}

/**
 * parses the result of `data.toString()`
 * 
 * @param {string} str data
 */
export function dataFromString( str: string ): Data
{
    return dataFromStringWithOffset( str ).data;
}

function parseWords( words: FormattedBrackets ): Data
{
    let start = words[0];
    while( start.startsWith("(") ) start = start.slice(1);
    if( /^\(?(\s*)?Constr/.test(start) )
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
    if( /^\(?(\s*)?Map/.test(start) )
    {
        if( Array.isArray( words[1] ) )
        {
            const pairs = words[1] as { k: FormattedBrackets, v: FormattedBrackets }[];
            return new DataMap( pairs.map(({ k,v }) => new DataPair( parseWords(k), parseWords(v) ) )); 
        }
        else return dataFromString( words[0] );
    }
    if( /^\(?(\s*)?List/.test(start) )
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
        const [ _, valueStr ] = start.split("#");
        return new DataB( valueStr );
    }
    
    throw new Error("invalid string to parse Data; " + JSON.stringify( words ));
}