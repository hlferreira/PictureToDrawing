export class ImageStore {
    public image: HTMLImageElement | undefined;
    public bucketImage: HTMLImageElement | undefined;
    public lineImage: HTMLImageElement | undefined;

    setImage(image: any){
        this.image = image;
    }
    setBucketImage(image: any){
        this.bucketImage = image;
    }
    setLineImage(image: any){
        this.lineImage = image;
    }
}