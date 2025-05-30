import { Data } from "../Data";

export type ToDataVersion = "v1" | "v2" | "v3";

export interface ToData {
    toData: ( version?: ToDataVersion ) => Data
}