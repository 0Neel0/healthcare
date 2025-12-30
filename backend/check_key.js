import dotenv from 'dotenv';
dotenv.config();
console.log('Checking GEMINI_API_KEY...');
if (process.env.GEMINI_API_KEY) {
    console.log('SUCCESS: API Key found.');
    console.log('Key length:', process.env.GEMINI_API_KEY.length);
    console.log('First 4 chars:', process.env.GEMINI_API_KEY.substring(0, 4));
} else {
    console.log('FAILURE: API Key NOT found in process.env');
}
