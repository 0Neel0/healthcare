import axios from 'axios';

const test = async () => {
    try {
        const res = await axios.get('http://localhost:4000/api/reports/revenue');
        console.log("Status:", res.status);
        console.log("Data:", JSON.stringify(res.data, null, 2));
    } catch (err) {
        console.error("Error Message:", err.message);
        console.error("Error Code:", err.code);
        if (err.response) {
            console.error("Response Status:", err.response.status);
            console.error("Response Data:", err.response.data);
        }
    }
};

test();
