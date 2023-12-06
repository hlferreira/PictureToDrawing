export {}

declare global {
    interface Window {
        cvInit: () => void;
        cv: any;
    }
}