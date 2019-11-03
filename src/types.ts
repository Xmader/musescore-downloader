
interface SourceData {
    type: string;  // "audio"
    title: string;  // "Musescore audio"
    nid: number;
}

type CommentData = any;

interface PartData {
    part: {
        name: string;
        program: number;
    }
}

interface Metadata {
    title: string;
    subtitle?: string;
    composer?: string;
    poet?: string;
    pages: number;
    measures: number;
    lyrics: number;
    chordnames: number;
    keysig: number;
    duration: number;
    dimensions: number;
    parts: PartData[];
}

interface ScoreJson {
    id: number;
    vid: number;
    dates: {
        revised: number;
    };
    secret: string;
    permalink: string;
    custom_url: string;
    format: string;  // "0"
    has_custom_audio: 0 | 1;
    metadata: Metadata;
}

interface UrlsData {
    midi: string;
    mp3: string;
    space: string;
    image_path: string;
    media?: string[];
}

interface AccessControlData {
    enabled: boolean;
    hasAccess: boolean;
}

interface PianoKeyboardData extends AccessControlData {
    midiUrl: string;
}

interface PianoRollData extends AccessControlData {
    resourcesUrl: string;
    feedbackUrl: string;
    forceShow: boolean;
}

export interface ScorePlayerData {
    embed: boolean;
    sources: SourceData[];
    default_source?: SourceData;
    mixer?: string;
    secondaryMixer?: string;
    bucket?: string;  // "https://musescore.com/static/musescore/scoredata"
    json: ScoreJson;
    render_vector: boolean;
    comments: CommentData[];
    score_id: number;
    urls: UrlsData;
    sendEvents?: boolean;
    pianoKeyboard: PianoKeyboardData;
    pianoRoll: PianoRollData;
}
