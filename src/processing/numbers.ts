import { Coordinates, Dimensions } from './color';

export function applyColorTextToCanvas(canvas: HTMLCanvasElement, colorNumber: number, coordinates?: Coordinates[]) {
    console.log(coordinates, canvas.width, canvas.height)
    if(!coordinates){
        return
    }

    const image = new cv.Mat(canvas.width, canvas.height, cv.CV_8UC4, new cv.Scalar(255,255,255,0));

    for(let coord of coordinates) {
        cv.putText(image, `${colorNumber+1}`, new cv.Point(coord.x, coord.y), cv.FONT_HERSHEY_SCRIPT_SIMPLEX, 0.2, new cv.Scalar(0, 0, 0, 255), 1);
    }

    cv.imshow(canvas, image);
}