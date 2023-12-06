import { BucketManager, ImageStore } from "../processing";

export let bucketManager: BucketManager;
export let imageStore: ImageStore; //create singleton

export function bootstrap() {
    bucketManager = new BucketManager(8);
    imageStore = new ImageStore();
}