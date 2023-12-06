export interface Coordinates {
    x: number;
    y: number;
}

export interface Color {
    color:{
        red: number;
        green: number;
        blue: number;
    }
    count: number;
    contours: any;
    number: number;
    textPositions?: Coordinates[]; 
}

export interface Dimensions {
    rows: number;
    columns: number;
}