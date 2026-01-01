import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

const testImagePath = path.join(process.cwd(), 'test_pixel.png');

// Create a valid 1x1 transparent PNG file
const pngBuffer = Buffer.from('89504E470D0A1A0A0000000D49484452000000010000000108060000001F15C4890000000A49444154789C63000100000500010D0A2D600000000049454E44AE426082', 'hex');
fs.writeFileSync(testImagePath, pngBuffer);

async function testBackendOnly() {
    console.log("Testing Backend Route: http://localhost:4000/api/medical-imaging/analyze");

    const formData = new FormData();
    formData.append("image", fs.createReadStream(testImagePath), {
        filename: 'test_pixel.png',
        contentType: 'image/png'
    });

    try {
        const response = await fetch('http://localhost:4000/api/medical-imaging/analyze', {
            method: 'POST',
            body: formData,
            headers: formData.getHeaders() // node-fetch needs this !!
        });

        console.log(`Response Status: ${response.status}`);
        const text = await response.text();
        console.log(`Response Body: ${text}`);

    } catch (error) {
        console.error("Test Failed:", error);
    }
}

testBackendOnly();
