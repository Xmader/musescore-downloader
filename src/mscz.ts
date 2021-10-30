import { assertRes, getFetch } from "./utils";
import { ScoreInfo } from "./scoreinfo";

export const MSCZ_BUF_SYM = Symbol("msczBufferP");
export const MSCZ_URL_SYM = Symbol("msczUrl");

export const loadMsczUrl = async (
    scoreinfo: ScoreInfo,
    _fetch = getFetch()
): Promise<string> => {
    // look for the persisted msczUrl inside scoreinfo
    let result = scoreinfo.store.get(MSCZ_URL_SYM) as string;
    if (result) {
        return result;
    }

    scoreinfo.store.set(MSCZ_URL_SYM, result); // persist to scoreinfo
    return result;
};

export const fetchMscz = async (
    scoreinfo: ScoreInfo,
    _fetch = getFetch()
): Promise<ArrayBuffer> => {
    let msczBufferP = scoreinfo.store.get(MSCZ_BUF_SYM) as
        | Promise<ArrayBuffer>
        | undefined;

    if (!msczBufferP) {
        msczBufferP = (async (): Promise<ArrayBuffer> => {
            const url = await loadMsczUrl(scoreinfo, _fetch);
            const r = await _fetch(url);
            assertRes(r);
            const data = await r.arrayBuffer();
            return data;
        })();
        scoreinfo.store.set(MSCZ_BUF_SYM, msczBufferP);
    }

    return msczBufferP;
};

// eslint-disable-next-line @typescript-eslint/require-await
export const setMscz = async (
    scoreinfo: ScoreInfo,
    buffer: ArrayBuffer
): Promise<void> => {
    scoreinfo.store.set(MSCZ_BUF_SYM, Promise.resolve(buffer));
};
