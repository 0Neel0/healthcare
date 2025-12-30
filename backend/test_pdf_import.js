import pdf from 'pdf-parse';
console.log('PDF Parse imported successfully:', pdf);
try {
    if (typeof pdf === 'function') {
        console.log('It is a function');
    } else {
        console.log('It is not a function, it is:', typeof pdf);
    }
} catch (e) {
    console.error(e);
}
