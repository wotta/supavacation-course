import { nanoid } from 'nanoid';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient({
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY,
});

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '10mb',
        },
    }
}

export default async function handler(request, response) {
    if (request.method !== 'POST') {
        response.setHeader('Allow', ['POST']);

        response.status(405)
            .json({ message: `HTTP method ${request.method} is not supported.` });

        return response;
    }

    let { image } = request.body;

    if (! image ) {
        return response.status(500).json({ message: 'No image provided' });
    }

    try {
        const contentType = image.match(/data:(.*);base64/)?.[1];
        const base64FileData = image.split('base64,')?.[1];

        if (! contentType || ! base64FileData) {
            return response.status(500).json({ message: 'Image data invalid' });
        }

        const fileName = nanoid();
        const extension = contentType.split('/')[1];
        const path = `${fileName}.${extension}`;

        const { data, error: uploadError } = await supabase.storage
            .from(process.env.SUPABASE_BUCKET)
            .upload(path, decode(base64FileData), {
                contentType,
                upsert: true,
            });

        if (uploadError) {
            throw new Error('Unable to upload image to storage');
        }

        const url = `${process.env.SUPABASE_URL.replace(
            '.co',
            '.in'
        )}/storage/v1/object/public/${data.Key}`;

        return response.status(201).json({ url });
    } catch (error) {
        return response.status(500).json({ message: 'Something went wrong' });
    }
}