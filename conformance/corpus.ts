/**
 * Measures this library's Plutus Data decoder against the cardano-cbor-dataset
 * corpus (node-diversity-conformance `cbor-decoding`, corpus `conway-123-100`).
 * The corpus is read as data only.
 *
 *   bun conformance/corpus.ts <dataset>/conway-123-100 [--json] [--list]
 *
 * plutus_data is a pure Data rule: a valid sample must decode and re-encode
 * to its exact bytes (hashed rule); an invalid one (`zap-*`) must be rejected.
 *
 * datum_option, redeemer and redeemers only carry Data: the Data part is
 * extracted with plain CBOR and measured the same way. For their invalid
 * samples the count is "Data part rejected" (the mutation may sit outside the
 * Data, which this library does not see), so it is a lower bound of what the
 * full ledger decoder rejects thanks to this library, not a rule score.
 */
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { Cbor, CborArray, CborMap, CborObj, CborTag, CborBytes, CborUInt } from "@harmoniclabs/cbor";
import { toHex } from "@harmoniclabs/uint8array-utils";
import { dataFromCborObj, dataToCbor, dataToCborObj } from "../src";

const args = process.argv.slice(2);
const dir = args.find(a => !a.startsWith("--"));
if (!dir || !existsSync(dir)) throw new Error("usage: bun conformance/corpus.ts <dataset>/conway-123-100");
const LIST = args.includes("--list");

type Extract = (bytes: Uint8Array) => Uint8Array[]; // the Data items' source bytes

const sub = (o: CborObj): Uint8Array => {
    if (!o.subCborRef) throw new Error("no subCborRef");
    return o.subCborRef.toBuffer();
};

/** whole input must be exactly one CBOR item */
function parseAll(bytes: Uint8Array): CborObj {
    const { parsed, offset } = Cbor.parseWithOffset(bytes);
    if (offset !== bytes.length) throw new Error(`trailing bytes (${bytes.length - offset})`);
    return parsed;
}

const EXTRACT: Record<string, Extract> = {
    plutus_data: (b) => [b],
    // datum_option = [0, hash32] / [1, #6.24(bytes .cbor plutus_data)]
    datum_option: (b) => {
        const o = parseAll(b);
        if (!(o instanceof CborArray) || o.array.length !== 2) throw new Error("not a datum_option");
        const [k, v] = o.array;
        if (!(k instanceof CborUInt)) throw new Error("bad selector");
        if (k.num === 0n) return [];
        if (k.num !== 1n || !(v instanceof CborTag) || !(v.data instanceof CborBytes)) throw new Error("bad inline datum");
        return [v.data.bytes];
    },
    // redeemer = [tag, index, data, ex_units]
    redeemer: (b) => {
        const o = parseAll(b);
        if (!(o instanceof CborArray) || o.array.length !== 4) throw new Error("not a redeemer");
        return [sub(o.array[2])];
    },
    // redeemers = [+ redeemer] / { + [tag, index] => [data, ex_units] }
    redeemers: (b) => {
        const o = parseAll(b);
        if (o instanceof CborArray) return o.array.map(r => {
            if (!(r instanceof CborArray) || r.array.length !== 4) throw new Error("not a redeemer");
            return sub(r.array[2]);
        });
        if (o instanceof CborMap) return o.map.map(({ v }) => {
            if (!(v instanceof CborArray) || v.array.length !== 2) throw new Error("not a redeemer value");
            return sub(v.array[0]);
        });
        throw new Error("not redeemers");
    },
};

/** decode one Data item the way a ledger decoder hands it over (a parsed CborObj) */
function decodeData(bytes: Uint8Array) {
    const d = dataFromCborObj(parseAll(bytes));
    return d;
}

function files(p: string): string[] {
    return existsSync(p) ? readdirSync(p).filter(f => f.endsWith(".cbor")).sort() : [];
}

const report: Record<string, any> = {};
for (const rule of Object.keys(EXTRACT)) {
    const extract = EXTRACT[rule];
    const r = {
        valid: 0, validDecoded: 0, validExact: 0, validExactCborObj: 0,
        invalid: {} as Record<string, { total: number, dataRejected: number, extractFailed: number }>,
        failures: [] as string[],
    };
    for (const f of files(join(dir, rule, "valid"))) {
        r.valid++;
        const bytes = new Uint8Array(readFileSync(join(dir, rule, "valid", f)));
        let items: Uint8Array[];
        try { items = extract(bytes); } catch (e: any) { r.failures.push(`valid/${f}: extract: ${e.message}`); continue; }
        try {
            const ds = items.map(decodeData);
            r.validDecoded++;
            const exact = ds.every((d, i) => toHex(dataToCbor(d)) === toHex(items[i]));
            const exactObj = ds.every((d, i) => toHex(Cbor.encode(dataToCborObj(d))) === toHex(items[i]));
            if (exact) r.validExact++;
            else r.failures.push(`valid/${f}: re-encoding differs: ${toHex(items[0]).slice(0, 80)} -> ${toHex(dataToCbor(ds[0])).slice(0, 80)}`);
            if (exactObj) r.validExactCborObj++;
        } catch (e: any) { r.failures.push(`valid/${f}: ${e.message}`); }
    }
    const inv = join(dir, rule, "invalid");
    for (const z of existsSync(inv) ? readdirSync(inv).sort() : []) {
        const c = r.invalid[z] = { total: 0, dataRejected: 0, extractFailed: 0 };
        for (const f of files(join(inv, z))) {
            c.total++;
            const bytes = new Uint8Array(readFileSync(join(inv, z, f)));
            let items: Uint8Array[];
            try { items = extract(bytes); }
            catch { c.extractFailed++; continue; } // rejected before reaching Data (not this library)
            try { items.forEach(decodeData); if (rule === "plutus_data") r.failures.push(`invalid/${z}/${f}: accepted ${toHex(bytes).slice(0, 80)}`); }
            catch { c.dataRejected++; }
        }
    }
    report[rule] = r;
}

if (args.includes("--json")) console.log(JSON.stringify(report, null, 2));
else for (const [rule, r] of Object.entries(report)) {
    const inv = Object.entries(r.invalid as Record<string, any>)
        .map(([z, c]: any) => `${z} ${c.dataRejected}/${c.total - c.extractFailed}` + (c.extractFailed ? ` (+${c.extractFailed} not Data-shaped)` : ""))
        .join(", ");
    console.log(`${rule}: valid decoded ${r.validDecoded}/${r.valid}, byte-exact dataToCbor ${r.validExact}/${r.valid}, via dataToCborObj ${r.validExactCborObj}/${r.valid}; Data part rejected: ${inv}`);
    if (LIST) for (const f of r.failures) console.log("   " + f);
}
