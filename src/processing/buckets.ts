export class BucketManager {
    numberOfBuckets: number = 3;
    normalizedBuckets: number[] = [];
    bucketSize: number = Math.floor(255/3);

    constructor(numberOfBuckets: number) {
        this.numberOfBuckets = numberOfBuckets;
        this.bucketSize = Math.floor(255/numberOfBuckets);
        this.normalizedBuckets = this.createBuckets(numberOfBuckets)
    }

    private createBuckets(buckets: number): number[] {
        return Array.from({length: buckets}, (_, index) => Math.floor((index*this.bucketSize + this.bucketSize/2)));
    }

    public pixelToBucket(value: number, buckets: number[] = this.normalizedBuckets): number {
        return buckets[Math.floor(value/256*this.numberOfBuckets)]
    }

    public setBuckets(buckets: number) {
        this.numberOfBuckets = buckets;
        this.bucketSize = Math.floor(255/this.numberOfBuckets);
        this.normalizedBuckets = this.createBuckets(buckets)
        console.log('Changing buckets to', this.normalizedBuckets, this.numberOfBuckets, this.bucketSize);
    }
}

/* SPLIT */
/*         let rgbaPlanes = new cv.MatVector();
        cv.split(image, rgbaPlanes)
        let r = rgbaPlanes.get(0)
        let g = rgbaPlanes.get(1)
        let b = rgbaPlanes.get(2) */