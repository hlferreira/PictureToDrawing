import './style.css';
import { For, createEffect, createSignal, on } from "solid-js";
import { Color, createLinePainting, findColorInImage, clearContour, applyColorTextToCanvas } from "../../processing";
import { bucketManager } from "../../bootstrap";
import { linePaintingProgress$ } from '../../processing/util';
import { finalize } from 'rxjs';

export default function LineImage(props: {painting: any}) {
    const [imageSize, setImageSize] = createSignal<{rows: number, cols: number}>({rows: 0, cols: 0});
    const [colors, setColors] = createSignal<Color[]>();
    const [loading, setLoading] = createSignal(false);
    const [selectedColor, setSelectedColor] = createSignal<Color | undefined>(undefined);
    const [threshold, setThreshold] = createSignal<number>(150);
    const [currentHoveredColor, setCurrentHoveredColor] = createSignal<Color | undefined>();
    const [lineImage, setLineImage] = createSignal();

    /**Canvas for multiple operations
     * @canvasLine - final product, canvas that holds the lines
     * @colorPreview - helper canvas, this canvas holds a preview of the each color - could be optimized
     * @canvasText - holds canvasLine color numbers, can't be in the same canvas since any change operations would also apply to the numbers
     *               preview also affects this canvas - should be a separate jsx element
     */
    const canvasLine: HTMLCanvasElement = <canvas id="lineCanvas"></canvas> as HTMLCanvasElement;
    const colorPreview: HTMLCanvasElement = <canvas id="colorPreviewCanvas"></canvas> as HTMLCanvasElement;
    const canvasText: HTMLCanvasElement = <canvas id="textCanvas"></canvas> as HTMLCanvasElement;

    createEffect(on(() => props.painting, drawPainting));
    createEffect(on(
                 () => selectedColor() || currentHoveredColor(),
                 (color: Color | undefined) => { 
                    if(color){
                        setLoading(true);
                        findColorInImage(props.painting, color.color, colorPreview, color.contours);
                        applyColorTextToCanvas(canvasText, color.number, color.textPositions)
                        setLoading(false);
                    }
                 }
                ));

    function drawPainting() {
        if(!props.painting){
            return;
        }

        const values: Color[] = []

        setLoading(true)
        setImageSize({ rows: props.painting.rows, cols: props.painting.cols })
        const linePainting = createLinePainting(props.painting, bucketManager.normalizedBuckets, canvasLine, canvasText, threshold());
        
        linePaintingProgress$.pipe(
            finalize(() => {
                setLoading(false)
            })
        ).subscribe((color: Color) => {
            values.push(color);
            console.log(color.textPositions)
            const sorted = values
                    .filter((value: Color | undefined) => value && value.contours.size())
                    .sort((a: Color, b: Color) => a.count < b.count ? 1 : -1);

            setColors(sorted);
        })

        setLineImage(linePainting);

    }

    // TODO change color
    function subColor(){

    }

    function removeColor(){
        clearContour(lineImage(), selectedColor()?.contours, canvasLine);
        setSelectedColor(undefined);
    }

    return <div class="linePaintingWrapper">
        {!currentHoveredColor() ? canvasLine : colorPreview}
        {loading() && <div class='loading' >Loading</div>}

        <div class="colors-container">
            <For each={colors()}>{
                (color: Color) => 
                <div class={`color-square ${selectedColor() === color || currentHoveredColor() === color ? 'selected-color': ''}`} 
                style={`background-color: rgb(${color.color.red}, ${color.color.green}, ${color.color.blue})`} 
                         onMouseEnter={() => !selectedColor() && setCurrentHoveredColor(color)}
                         onMouseLeave={() => !selectedColor() && setCurrentHoveredColor(undefined)}
                         onClick={() => setSelectedColor(selectedColor() === color ? undefined : color)}
                         >
                            {selectedColor() === color ? color.number : undefined}
                    </div>
            }</For>
        </div>

        <div class="colors-wrapper">
            <div class="color-info">
                <div>
                    {colors()?.length && `Current number of colors is ${colors()?.length}`}
                </div>
                <div class="info-lines">
                    {currentHoveredColor() && `This color represents ${(((currentHoveredColor()?.count || 0)/(imageSize().rows * imageSize().cols)) * 100).toFixed(2)}% of the image`}
                </div>
            </div>
            <button class="button-remove" onClick={removeColor} disabled={!selectedColor()}>Remove</button>
            <button class="button-sub" onClick={subColor} disabled={!selectedColor()}>Change</button>
        </div>

        <div class="slider-container">
            <div>
                <a class="slide-title">Ignore threshold</a>
                {' ' + threshold()}
            </div>
            <input type="range" min="0" max="500" onchange={({target}: {target: HTMLInputElement}) => setThreshold(parseInt(target.value))} value={threshold()}/>
        </div>
        <button onClick={() => drawPainting()}>Click me!</button>

        {canvasText}
      </div>
}