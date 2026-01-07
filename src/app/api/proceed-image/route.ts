import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    // Get uploaded images
    const files = Array.from(formData.entries())
      .filter(([key]) => key.startsWith("image_"))
      .map(([, value]) => value as File);

    if (files.length === 0) {
      return NextResponse.json(
        { error: "No images provided" },
        { status: 400 }
      );
    }

    // Path to watermark images
    const watermark1Path = path.join(
      process.cwd(),
      "public/images/watermark1.png"
    );
    const watermark2Path = path.join(
      process.cwd(),
      "public/images/watermark2.png"
    );

    const watermark1 = await sharp(watermark1Path)
      .resize(150, 150)
      .png({ quality: 80, progressive: true })
      .toBuffer();
    const watermark2 = await sharp(watermark2Path)
      .resize(150, 150)
      .png({ quality: 80, progressive: true })
      .toBuffer();

    const margin = 38; // Margin from edges and between watermarks

    const processedImages = await Promise.all(
      files.map(async (file) => {
        const buffer = Buffer.from(await file.arrayBuffer());
        const image = sharp(buffer);

        // Calculate positions for watermarks
        const watermark1X = 1080 - 150 - margin;
        const watermark1Y = margin;

        const watermark2X = watermark1X;
        const watermark2Y = watermark1Y + 150 + margin;

        // Resize image to 1080x1080 and add watermarks
        const resizedImage = await image
          .flatten({ background: { r: 255, g: 165, b: 0 } })
          .resize(1080, 1080, {
            fit: "cover",
          })
          .toBuffer();

        let quality = 100;
        let finalImage = await sharp(resizedImage)
          .composite([
            { input: watermark1, top: watermark1Y, left: watermark1X },
            { input: watermark2, top: watermark2Y, left: watermark2X },
          ])
          .jpeg({
            quality,
            progressive: true,
          })
          .toBuffer();

        while (finalImage.length > 2 * 1024 * 1024 && quality > 30) {
          quality -= 5;
          finalImage = await sharp(resizedImage)
            .composite([
              { input: watermark1, top: watermark1Y, left: watermark1X },
              { input: watermark2, top: watermark2Y, left: watermark2X },
            ])
            .jpeg({
              quality,
              progressive: true,
            })
            .toBuffer();
        }

        return `data:image/jpeg;base64,${finalImage.toString("base64")}`;
      })
    );

    return NextResponse.json({ processedImages });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Image processing failed" },
      { status: 500 }
    );
  }
}
