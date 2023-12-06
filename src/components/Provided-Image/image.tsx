//let src = cv.imread('canvasInput');
//let dst = cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC3);
/* cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0);
cv.threshold(src, src, 120, 200, cv.THRESH_BINARY);
let contours = new cv.MatVector();
let hierarchy = new cv.Mat();
// You can try more different parameters
cv.findContours(src, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);
// draw contours with random Scalar
for (let i = 0; i < contours.size(); ++i) {
    let color = new cv.Scalar(Math.round(Math.random() * 255), Math.round(Math.random() * 255),
                              Math.round(Math.random() * 255));
    cv.drawContours(dst, contours, i, color, 1, cv.LINE_8, hierarchy, 100);
}
cv.imshow('canvasOutput', dst);
src.delete(); dst.delete(); contours.delete(); hierarchy.delete(); */
import { imageStore } from '../../bootstrap';
import BucketsImage from '../Buckets-Image/image';
import './style.css'
import { createEffect, createSignal } from 'solid-js'

export default function ProvidedImage() {
    const [providedImage, setProvidedImage] = createSignal<string | undefined>('/Bilbao-11.jpg');
    const [renderedImage, setRenderedImage] = createSignal(<img id="renderedImage" src={providedImage()} onLoad={setImage}></img> as HTMLImageElement);
    const [loadedImage, setLoadedImage] = createSignal(undefined)

    createEffect(() => {
        setRenderedImage(<img id="renderedImage" src={providedImage()} onLoad={setImage}></img> as HTMLImageElement);
    })

    async function setImage() {
        const imageMat = cv.imread(renderedImage()) 
        setLoadedImage(imageMat);
        imageStore.setImage(imageMat);
    }

    function loadImage({target}: any){
        const file = target.files[0];
        const reader = new FileReader();
        // when image is loaded, set the src of the image where you want to display it
        reader.onload = function(e) { 
            if(e.target && e.target.result && typeof e.target.result === 'string' ) {
                setProvidedImage(e.target.result)
            }
        };
        reader.readAsDataURL(file);
    }
    
    return <>
        <div class="provided-image">
            {renderedImage()}
            <input type='file' onInput={loadImage} accept=".jpg, .jpeg, .png"/>
        </div>
        <br/>
        {
            loadedImage() && <BucketsImage image={loadedImage()}/>
        }
    </>
}
