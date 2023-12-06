// Return promise with finished value but split the for in chunks so it can update
// Ideally its an observable that returns chunks of the painting

import { Subject } from "rxjs";
import { Color } from "./color";

export let linePaintingProgress$: Subject<Color> = new Subject<Color>();

export function createLinePainting(image: any, buckets: number[], canvas: HTMLCanvasElement, textCanvas: HTMLCanvasElement, threshold: number = 150): Promise<any> {
    console.log("Image size: ", image.rows, image.cols);
    let blankImage = new cv.Mat(image.rows, image.cols, cv.CV_8UC3, new cv.Scalar(255,255,255,255));
    let textImage = new cv.Mat(image.rows, image.cols, cv.CV_8UC4, new cv.Scalar(255,255,255,0));
    let colorCount = 0;

    const imageProps: any = {
        d: {},
        colorDic: {},
        contourDic: {},
        sizes: {}
    }

    //const pastel = cv2.add(mergeImage, white.astype(np.uint8))
    const promises = [];
    for(let red of buckets) {
        for(let green of buckets) {
            for(let blue of buckets) {
                const promise = new Promise<void>((resolve) => 
                    setTimeout(() => {
                        //creates an array/image with all the pixels with the specific color
                        const { colorMat, count } = findSpecificColor(image, {red, green, blue}, canvas)
                        if(count <= 50){
                            colorMat.delete();
                            resolve(undefined);
                            return;
                        }

                        const contours = new cv.MatVector(); // has to be mask to find contours
                        const hierarchy = new cv.Mat();
                        // try different params
                        cv.findContours(colorMat, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_TC89_L1);
                        console.log('contours ', contours);

                        const filteredContours = new cv.MatVector();
                        const textPositions = []
                        // Go through contours to add Text
                        for(let i=0; i < contours.size(); i++) {
                            const contour = contours.get(i);
                            // compute the center of the contour
                            const M = cv.moments(contour, false);
                            if(M.m00 === 0){
                                continue;
                            }
                            const area = cv.contourArea(contour);
                            if(area < threshold) {
                                continue;
                            }

                            const cX = Math.floor(M.m10 / M.m00);
                            const cY = Math.floor(M.m01 / M.m00);
                            textPositions.push({x: cX, y: cY})
                            //const ar = cv2.contourArea(contour)
                            cv.putText(textImage, `${colorCount+1}`, new cv.Point(cX, cY), cv.FONT_HERSHEY_SCRIPT_SIMPLEX, 0.2, new cv.Scalar(0, 0, 0, 255), 1);
                            filteredContours.push_back(contour);
                        }

                        cv.drawContours(blankImage, filteredContours, -1, new cv.Scalar(0, 0, 0), 1, cv.LINE_8);
                        if(filteredContours.size()) {
                            colorCount++; 
                        }
                        hierarchy.delete();

                        console.log(textPositions)
                        cv.imshow(canvas, blankImage);
                        cv.imshow(textCanvas, textImage);
                        linePaintingProgress$.next({color: {red, green, blue}, count, contours: filteredContours, number: colorCount, textPositions})
                        resolve()
                    }, 0)
                )
                    
                promises.push(promise);
            }
        }
    }

    Promise.all(promises).then(() => {
        console.log("complete");
        linePaintingProgress$.complete()
        linePaintingProgress$ = new Subject<Color>()
    })

    //linePaintingProgress$ = new Subject();
    return blankImage;
    //don't forget to delete Mats
}

/**
 * findSpecificColor
 * @param image Image where to search for a color
 * @param values
 * @param values.red red value to search for
 * @param values.green green value to search for
 * @param values.blue blue value to search for
 * @returns { 
 *  colorMat: any 
 *  hasColor: boolean 
 *  count: number
 * }
 * colorMat is the matrix with all the values of the image that match all three values
 * count is the amount of pixels that match that color 
 */
function findSpecificColor(image: any, {red, green, blue}: {red: number, green: number, blue:number}, canvas:any): { colorMat: any, count: number} {
    //specificColor = np.vectorize(lambda r,g,b,red,green,blue: 255 if r == red and g == green and b == blue else 0)
    // create black image with same size
    const colorMat = new cv.Mat(image.rows, image.cols, cv.CV_8U);
    let count = 0;
    
    for(let i = 0; i < image.data?.length; i+=4){
        if(image.data[i] === red && image.data[i+1] === green && image.data[i+2] === blue) {
            colorMat.data[i/4] = 255;
            count++;
        }
        else {
            colorMat.data[i/4] = 0;
        }
    }
    return { colorMat, count}
}

function calcTextProperties(): { position: { x: number, y: number }, size: number} {
    /* kpCnt = len(contour)
    x,y = 0,0
    for kp in contour:
        x, y = x+kp[0][0], y+kp[0][1]
    point = (int(x/kpCnt) - 3, int(y/kpCnt) - 3)
    size = max(0.2, min(0.5,(ar/500)/2)) */
    return {position: {x: 0, y: 0}, size: 0};
}

export function findColorInImage(image: any, {red, green, blue}: {red: number, green: number, blue:number}, canvas: HTMLCanvasElement, contours?: any){
    const colorImage = new cv.Mat(image.rows, image.cols, cv.CV_8UC3, new cv.Scalar(255,255,255));
    const im = image.clone();
    cv.cvtColor(image, im, cv.COLOR_RGBA2RGB);
    
    for(let i = 0; i < im.data?.length; i+=3){
        if(im.data[i] === red && im.data[i+1] === green && im.data[i+2] === blue) {
            colorImage.data[i] = red;
            colorImage.data[i+1] = green;
            colorImage.data[i+2] = blue;
        }
        else {
            colorImage.data[i] = 255;
            colorImage.data[i+1] = 255;
            colorImage.data[i+2] = 255;
        }
    }

    if(contours){
        cv.drawContours(colorImage, contours, -1, new cv.Scalar(0, 0, 0), 1, cv.LINE_8);
    }
    
    cv.imshow(canvas, colorImage);
    colorImage.delete();
}

export function clearContour(image: any, contour: any, canvas: HTMLCanvasElement) {
    // create an image with just that contour
    const blankImage = new cv.Mat(image.rows, image.cols, cv.CV_8UC3, new cv.Scalar(255,255,255));
    cv.drawContours(blankImage, contour, -1, new cv.Scalar(0, 0, 0), 1);
    
    // remove that contour
    applyMask(image, blankImage);
    console.log(blankImage);
    cv.imshow(canvas, image);
}

// There should be a better way of doing this ¯\_(ツ)_/¯
function applyMask(src1: any, src2: any) {
    for(let i = 0; i < src1.data?.length; i+=1) {
        if(src2.data[i] === 0) {
            src1.data[i] = 255;
        }
    }
}


export function clearSubject() {
    linePaintingProgress$.complete();
    linePaintingProgress$ = new Subject();
}