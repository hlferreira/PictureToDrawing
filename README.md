# 🚀 Picture to painting using opencv!

Unfinished project trying to convert images into line paintings to color afterwards.

This project was initialized with a python script, but was then changed to a web app so it could be personalized by clients as they wish.

Currently you can add a photo and it converts it into a line painting, while adding the number of the color onto the centroid point of the group of pixels with the same color.

# What the algorithm does

1. Color quantization - Since there are way to many different colored pixels, it would be unfeasible to draw a line to all available colors, so step 1 is reducing the amount of colors, by converting the pixel colors to the nearest bucket. So for a pixel with 120 red of 255, and with 3 buckets, meaning there are 3 values of red available for the image (in the ranges of 255/3 = 85, 170, 255), the adequate bucket would be the second one, between 85 and 170, and the converted value of that bucket is the middle point, so 120 would be converted roughly into 162.5.

2. Edge detection - This process finds the edges of agglomerates of pixels aka the actual drawn lines. But to do so we need to apply this algorithm onto every bucket color. The actual result of this process is really noisy so we decide a threshold of size of the agglomerate to be accepted as big enough to display.

3. Labelling the colors - To each existing color on the painting, we write on the centroid of the agglomerate the respective number of the color.

# Need to tackle problems

Most of these algorithms are cpu intensive as they deal with images that are _width_ * _height_ * 3, and by deciding to code this in the web app, as it would take to many resources out of a server, it is crucial that it remains responsive, which it currently isn't. Some solutions where implemented to make it mildly responsive, but probably the best solution would be to pass these intensive computation calculations onto a web worker.

Color quantization method works well, but to retrieve the best result of the image, the user should be able to tweak the actual values of the buckets to improve the image.

The edge detection also incurs in some issues regarding the noise of the image, currently if the bucket color does not have enough representation on the image, or if the agglomerate is too small we remove it from the line painting, however there are still a lot of agglomerates that technically have the required size to be represented, but are too slim and only appear as unnecessary lines on the display.

Also, if we draw the lines for a agglomerate, and then draw the same lines for the agglomerate right next to it, the frontier between both agglomerates displays two lines instead of one. This is particularly an issue when there are a good amount of agglomerates in a small area.

When labelling the colors, we also come into the issue of where to place the label. The first thought would be the center of the agglomerate, or the centroid. The issue is that it is not necessarily the most visible position to place it nor is it even necessarily inside the agglomerate. My current "solution" to avoid this issue it to create a page just with an interactive line painting that users could use a qr code to better know where the label belong in.


# Running the app

need to download opencv.js then run 

```
pnpm install
```

Followed by

```
pnpm start
```
