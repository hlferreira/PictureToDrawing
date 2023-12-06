import './style.css'
import { bucketManager, imageStore } from "../../bootstrap";
import { createSignal, createEffect, on, For } from 'solid-js'
import LineImage from '../Line-Image';


export default function BucketsImage(props: any | undefined){
    const [buckets, setBuckets] = createSignal(bucketManager.numberOfBuckets); // Use store?
    const [maxColors, setMaxColors] = createSignal(buckets()*buckets()*buckets());
    const [paintingImage, setPaintingImage] = createSignal();
    /* const [linePainting, setLinePainting] = createSignal<typeof LineImage>();
    const [erosion, setErosion] = createSignal(5); */
    const canvasImage = <canvas id="targetCanvas"></canvas>;
    
    createEffect(on(() => props.image, imageLoaded));
    createEffect(() => setMaxColors(buckets()*buckets()*buckets()));

    function imageLoaded() {
        if(!props.image){
            return
        }
        const newImage = props.image.clone();

        let M = new cv.Size(3, 3);
        cv.GaussianBlur(newImage, newImage, M, 0, 0, cv.BORDER_DEFAULT);
        
        for(let i = 0; i < newImage.data.length; i+=4){
            newImage.data[i] = bucketManager.pixelToBucket(newImage.data[i]);
            newImage.data[i + 1] = bucketManager.pixelToBucket(newImage.data[i+1]);
            newImage.data[i + 2] = bucketManager.pixelToBucket(newImage.data[i+2]);
        }
        
        imageStore.setBucketImage(newImage);
        cv.imshow(canvasImage, newImage);
    }

    function changeBuckets({target} : {target: HTMLInputElement}){
        bucketManager.setBuckets(parseInt(target.value));
        setBuckets(bucketManager.numberOfBuckets);
        setTimeout(imageLoaded, 0);
    }

    function open(image: any, kernelSize: number){
        const rgbaPlanes = new cv.MatVector();

        cv.split(image, rgbaPlanes);

        let anchor = new cv.Point(0, 0);
        const M = cv.Mat.ones(kernelSize, kernelSize, cv.CV_8U);
        // You can try more different parameters
        cv.morphologyEx(rgbaPlanes.get(0), rgbaPlanes.get(0), cv.MORPH_OPEN, M, anchor, 1,
            cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue());
        cv.morphologyEx(rgbaPlanes.get(1), rgbaPlanes.get(1), cv.MORPH_OPEN, M, anchor, 1,
            cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue());
        cv.morphologyEx(rgbaPlanes.get(2), rgbaPlanes.get(2), cv.MORPH_OPEN, M, anchor, 1,
            cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue());

        cv.merge(rgbaPlanes, image);
        rgbaPlanes.delete(); M.delete();
    }

    return <div id="bucketImage">
      {canvasImage}
      <div class="image-description">
        <div class="slider-container">
            <div>
                <a class="slide-title">Number of buckets:</a>
                {' ' + buckets()}
            </div>
            <input type="range" min="3" max="12" onchange={changeBuckets} value={bucketManager.numberOfBuckets}/>
        </div>
        <div class="color-description">
           {`Possible number of colors is ${maxColors()}`}
           { maxColors() > 100 && <div class="warning"> Warning: the maximum number of colors is 100 </div> }
        </div>
      </div>
      <button type='button' class="button-createPainting" onClick={() => setPaintingImage(imageStore.bucketImage)}>Create a painting</button>
      <LineImage painting={paintingImage()}/>
    </div>
}
