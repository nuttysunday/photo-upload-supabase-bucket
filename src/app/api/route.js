import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { createClient } from '@supabase/supabase-js';
import heic2any from 'heic2any';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const client = new S3Client({
  forcePathStyle: true,
  region: "us-west-1",
  endpoint: process.env.SUPABASE_BUCKET_URL,
  credentials: {
    accessKeyId: process.env.SUPABASE_BUCKET_ACCESS_KEY_ID,
    secretAccessKey: process.env.SUPABASE_BUCKET_SECRET_ACCESS_KEY,
  },
});

export async function POST(request) {
  const formData = await request.formData();
  const secret = formData.get('secret');
  const file = formData.get('file');
  const caption = formData.get('caption');
  const location = formData.get('location');
  const date = formData.get('date');

  if (secret !== process.env.SECRET_KEY) {
    return new Response(
      JSON.stringify({ message: "You are not authorized to upload." }),
      { status: 403 }
    );
  }

  if (!file) {
    return new Response(
      JSON.stringify({ message: "Please select a file first!" }),
      { status: 400 }
    );
  }

  try {
    let buffer;

    if (file.name.toLowerCase().endsWith('.heic')) {
      const arrayBuffer = await file.arrayBuffer();
      const heicBlob = new Blob([arrayBuffer]);
      const convertedImage = await heic2any({ blob: heicBlob, toType: 'image/jpeg' });

      buffer = Buffer.from(await convertedImage.arrayBuffer());
    } else {
      const arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    }

    const command = new PutObjectCommand({
      Bucket: "photographs",
      Key: `uploads/${file.name}`,
      Body: buffer,
      ContentType: file.type,
    });

    await client.send(command);

    const fileUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/photographs/uploads/${file.name}`;

    const { data, error } = await supabase
      .from('photos')
      .insert([
        {
          filename: file.name,
          caption,
          location,
          date: date || new Date().toISOString(),
          file_url: fileUrl,
        },
      ]);

    if (error) {
      throw new Error(error.message);
    }

    return new Response(
      JSON.stringify({ message: "File uploaded and metadata saved successfully!" }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ message: `Upload failed: ${error.message}` }),
      { status: 500 }
    );
  }
}
